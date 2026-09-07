/**
 * @forge-apps/code - Single-Seat Session Coordinator & 60s Takeover Engine (2026 LTS)
 * Remote-Desktop Concurrency with Automatic Takeover Resolution
 */

import { randomUUID } from 'node:crypto';
import { createLogger } from './lib/sdk';
import {
  deleteActiveSession,
  getActiveSession,
  getProjectById,
  upsertActiveSession,
} from './db';
import type { ActiveSessionRecord } from './db/schema';
import { discardRepoModifications } from './git-sanitizer';

const logger = createLogger('code-session-coordinator');
const HEARTBEAT_TIMEOUT_MS = 25_000;
const TAKEOVER_DURATION_MS = 60_000;

/**
 * ClaimResult
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export interface ClaimResult {
  success: boolean;
  status: 'CLAIMED' | 'LOCKED' | 'PENDING_TAKEOVER' | 'ACTIVE';
  session?: ActiveSessionRecord;
  activeUser?: { email: string; name: string };
  expiresInSeconds?: number;
  message: string;
}

type Listener = (event: { type: string; payload: any }) => void;
const projectListeners = new Map<string, Set<Listener>>();

/**
 * subscribeToProjectEvents
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function subscribeToProjectEvents(projectId: string, listener: Listener): () => void {
  if (!projectListeners.has(projectId)) {
    projectListeners.set(projectId, new Set());
  }
  projectListeners.get(projectId)!.add(listener);
  return () => {
    projectListeners.get(projectId)?.delete(listener);
  };
}

/**
 * broadcastProjectEvent
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function broadcastProjectEvent(projectId: string, type: string, payload: any): void {
  const listeners = projectListeners.get(projectId);
  if (!listeners) return;
  for (const listener of listeners) {
    try {
      listener({ type, payload });
    } catch {
      // ignore subscriber error
    }
  }
}

function buildSession(pId: string, uId: string, email: string, name: string, now: number): ActiveSessionRecord {
  return {
    project_id: pId,
    session_id: randomUUID(),
    active_user_id: uId,
    active_user_email: email,
    active_user_name: name || email,
    status: 'ACTIVE',
    connected_at: now,
    last_heartbeat: now,
    takeover_requester_id: null,
    takeover_requester_email: null,
    takeover_requester_name: null,
    takeover_expires_at: null,
  };
}

/** Sweeps inactive sessions and auto-resolves expired takeover countdowns.  * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function checkSessionHealth(projectId: string): ActiveSessionRecord | null {
  const session = getActiveSession(projectId);
  if (!session) return null;

  const now = Date.now();

  // 1. Takeover countdown expired (60s without denial)
  if (
    session.status === 'PENDING_TAKEOVER' &&
    session.takeover_expires_at &&
    now >= session.takeover_expires_at
  ) {
    logger.info(`[TAKEOVER_EXPIRED] 60s expired on ${projectId}. Auto-transferring lock...`);
    const project = getProjectById(projectId);
    if (project) discardRepoModifications(project.fs_path);

    broadcastProjectEvent(projectId, 'SESSION_KICKED', {
      reason: 'Takeover timer expired without response. Changes were discarded.',
    });

    const newSession = buildSession(
      projectId,
      session.takeover_requester_id!,
      session.takeover_requester_email!,
      session.takeover_requester_name || '',
      now
    );
    upsertActiveSession(newSession);
    broadcastProjectEvent(projectId, 'SESSION_TRANSFERRED', newSession);
    return newSession;
  }

  // 2. Active user missed heartbeats
  if (now - session.last_heartbeat > HEARTBEAT_TIMEOUT_MS) {
    logger.warn(`[SESSION_STALE] Active user ${session.active_user_email} missed heartbeat. Releasing...`);
    const project = getProjectById(projectId);
    if (project) discardRepoModifications(project.fs_path);
    deleteActiveSession(projectId);
    broadcastProjectEvent(projectId, 'SESSION_RELEASED', { projectId });
    return null;
  }

  return session;
}

/** Claims or re-acquires the single-seat lock.  * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function claimSession(
  projectId: string,
  userId: string,
  userEmail: string,
  userName: string
): ClaimResult {
  const current = checkSessionHealth(projectId);
  const now = Date.now();

  if (!current) {
    const session = buildSession(projectId, userId, userEmail, userName, now);
    upsertActiveSession(session);
    broadcastProjectEvent(projectId, 'SESSION_STARTED', session);
    return { success: true, status: 'CLAIMED', session, message: 'Session acquired' };
  }

  if (current.active_user_id === userId) {
    current.last_heartbeat = now;
    upsertActiveSession(current);
    return { success: true, status: 'CLAIMED', session: current, message: 'Session resumed' };
  }

  const remainingSec = current.takeover_expires_at
    ? Math.max(0, Math.ceil((current.takeover_expires_at - now) / 1000))
    : 0;

  return {
    success: false,
    status: current.status,
    session: current,
    activeUser: { email: current.active_user_email, name: current.active_user_name },
    expiresInSeconds: remainingSec,
    message: `Repository is currently in use by ${current.active_user_email}`,
  };
}

/** Requests a 60-second takeover against the active user.  * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function requestTakeover(
  projectId: string,
  requesterId: string,
  requesterEmail: string,
  requesterName: string
): ClaimResult {
  const current = checkSessionHealth(projectId);
  if (!current) {
    return claimSession(projectId, requesterId, requesterEmail, requesterName);
  }

  if (current.active_user_id === requesterId) {
    return { success: true, status: 'CLAIMED', session: current, message: 'Already active user' };
  }

  const now = Date.now();
  current.status = 'PENDING_TAKEOVER';
  current.takeover_requester_id = requesterId;
  current.takeover_requester_email = requesterEmail;
  current.takeover_requester_name = requesterName;
  current.takeover_expires_at = now + TAKEOVER_DURATION_MS;

  upsertActiveSession(current);

  broadcastProjectEvent(projectId, 'TAKEOVER_REQUESTED', {
    requesterEmail,
    requesterName,
    expiresAt: current.takeover_expires_at,
    durationSeconds: 60,
  });

  return {
    success: true,
    status: 'PENDING_TAKEOVER',
    session: current,
    expiresInSeconds: 60,
    message: `Takeover requested. Active user ${current.active_user_email} has 60s to respond.`,
  };
}

/** Active user responds to takeover (Deny or Allow).  * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function respondToTakeover(
  projectId: string,
  userId: string,
  decision: 'ALLOW' | 'DENY'
): { success: boolean; message: string } {
  const current = getActiveSession(projectId);
  if (!current || current.active_user_id !== userId) {
    return { success: false, message: 'Not active session owner' };
  }

  const now = Date.now();

  if (decision === 'DENY') {
    current.status = 'ACTIVE';
    current.takeover_requester_id = null;
    current.takeover_requester_email = null;
    current.takeover_requester_name = null;
    current.takeover_expires_at = null;
    current.last_heartbeat = now;
    upsertActiveSession(current);

    broadcastProjectEvent(projectId, 'TAKEOVER_DENIED', {
      message: 'Active user retained the session',
    });
    return { success: true, message: 'Takeover rejected. Session retained.' };
  }

  // ALLOW: Transfer immediately
  const project = getProjectById(projectId);
  if (project) discardRepoModifications(project.fs_path);

  const newSession = buildSession(
    projectId,
    current.takeover_requester_id!,
    current.takeover_requester_email!,
    current.takeover_requester_name || '',
    now
  );
  upsertActiveSession(newSession);

  broadcastProjectEvent(projectId, 'SESSION_TRANSFERRED', newSession);
  return { success: true, message: 'Session handed over successfully.' };
}

/** User explicitly leaves or disconnects -> clean repo and release lock.  * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function leaveSession(projectId: string, userId: string): boolean {
  const current = getActiveSession(projectId);
  if (!current || current.active_user_id !== userId) {
    return false;
  }

  const project = getProjectById(projectId);
  if (project) discardRepoModifications(project.fs_path);

  deleteActiveSession(projectId);
  broadcastProjectEvent(projectId, 'SESSION_RELEASED', { projectId });
  return true;
}

/** Record heartbeat from active client.  * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function recordHeartbeat(projectId: string, userId: string): boolean {
  const current = getActiveSession(projectId);
  if (!current || current.active_user_id !== userId) {
    return false;
  }
  current.last_heartbeat = Date.now();
  upsertActiveSession(current);
  return true;
}
