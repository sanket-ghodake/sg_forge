/**
 * @forge-apps/code - Lock Coordinator & Takeover Unit Tests (Tier 1)
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it } from 'bun:test';
import {
  claimSession,
  leaveSession,
  requestTakeover,
  respondToTakeover,
} from '../../src/session-coordinator';
import { createProject, deleteProject } from '../../src/db';

describe('Tier 1 Unit: Lock Coordinator & Remote-Desktop Concurrency [LLR-SUB-001] [HLR-CODE-001] [LLR-CODE-001.1]', () => {
  const testProjId = `test-proj-${Date.now()}`;

  // Arrange test repository in DB
  createProject({
    id: testProjId,
    name: 'Test Unit Project',
    slug: `test-unit-${Date.now()}`,
    description: 'Unit testing repo',
    fs_path: `${process.cwd()}/test-unit-repo-${Date.now()}`,
    default_branch: 'main',
    is_active: 1,
    created_by: 'user-unit-admin',
  });

  it('claims an available repository for User A', () => {
    // Act
    const res = claimSession(testProjId, 'user-a', 'usera@forge.internal', 'User A');

    // Assert
    expect(res.success).toBe(true);
    expect(res.status).toBe('CLAIMED');
    expect(res.session?.active_user_id).toBe('user-a');
  });

  it('blocks User B from claiming while User A is active (Single-Seat Invariant)', () => {
    // Act
    const res = claimSession(testProjId, 'user-b', 'userb@forge.internal', 'User B');

    // Assert
    expect(res.success).toBe(false);
    expect(res.activeUser?.email).toBe('usera@forge.internal');
    expect(res.message).toContain('usera@forge.internal');
  });

  it('allows User B to initiate a 60-second takeover request', () => {
    // Act
    const res = requestTakeover(testProjId, 'user-b', 'userb@forge.internal', 'User B');

    // Assert
    expect(res.success).toBe(true);
    expect(res.status).toBe('PENDING_TAKEOVER');
    expect(res.expiresInSeconds).toBe(60);
    expect(res.session?.takeover_requester_id).toBe('user-b');
  });

  it('preserves User A session when User A rejects takeover', () => {
    // Act
    const rejectRes = respondToTakeover(testProjId, 'user-a', 'DENY');

    // Assert
    expect(rejectRes.success).toBe(true);
    expect(rejectRes.message).toContain('retained');

    const check = claimSession(testProjId, 'user-b', 'userb@forge.internal', 'User B');
    expect(check.success).toBe(false);
    expect(check.status).toBe('ACTIVE');
  });

  it('cleans up and frees the lock when active user leaves', () => {
    // Act
    const left = leaveSession(testProjId, 'user-a');
    expect(left).toBe(true);

    // Assert repo is now free for User B
    const claimB = claimSession(testProjId, 'user-b', 'userb@forge.internal', 'User B');
    expect(claimB.success).toBe(true);
    expect(claimB.session?.active_user_id).toBe('user-b');

    // Cleanup
    leaveSession(testProjId, 'user-b');
    deleteProject(testProjId);
  });
});
