/**
 * @forge/portal - Page Overview & View Dispatcher Component (2026 LTS)
 * Renders all 10 Employee Workspace and Admin Suite single-page views.
 */

import { astryxIcons } from '@forge/ui';
import type { HeaderUserContext } from './layout-header';
import { renderCanvasView } from './ui-renderer-canvas';
import { renderAppsView } from './ui-renderer-apps';
import { renderProfileView } from './ui-renderer-profile';
import { renderInboxView } from './ui-renderer-inbox';
import { renderAdminMembersView } from './ui-admin-members';
import { renderAdminAppsView } from './ui-admin-apps';
import { renderAdminOrgView } from './ui-admin-org';
import { renderAdminAuditView } from './ui-admin-audit';
import { renderAdminSettingsView } from './ui-admin-settings';

/**
 * PageDefinition
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export interface PageDefinition {
  id: string;
  title: string;
  category: 'Workspace' | 'Admin Console';
  iconSvg: string;
  badge: string;
  summary: string;
  targetAudience: string;
  features: Array<{ iconSvg: string; title: string; desc: string }>;
  nextSteps: string[];
}

/**
 * PORTAL_PAGES
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export const PORTAL_PAGES: PageDefinition[] = [
  // ── Employee Workspace Views ──
  {
    id: 'canvas',
    title: 'Company Map & Org Canvas',
    category: 'Workspace',
    iconSvg: astryxIcons.map,
    badge: 'Core Workspace',
    summary: 'An interactive visual map of the entire organization showing teams, departments, reporting lines, and who works where.',
    targetAudience: 'All Employees & Staff',
    features: [
      { iconSvg: astryxIcons.topology, title: '2D Visual Canvas', desc: 'Pan and zoom across Macro, Meso, and Micro organizational units smoothly.' },
      { iconSvg: astryxIcons.gitTree, title: 'Department Hierarchies', desc: 'Instantly see team leads, direct reports, and cross-functional project pods.' },
      { iconSvg: astryxIcons.search, title: 'Smart Search & Center', desc: 'Type any colleague name to automatically center the canvas on their node.' },
    ],
    nextSteps: ['Pan/zoom canvas engine integration', 'Real-time node positioning sync', 'Quick contact hover cards'],
  },
  {
    id: 'apps',
    title: 'Apps & Tools',
    category: 'Workspace',
    iconSvg: astryxIcons.rocket,
    badge: 'Launchpad',
    summary: 'A unified workspace for active daily tools, organization applications, and department access requests.',
    targetAudience: 'All Employees & Staff',
    features: [
      { iconSvg: astryxIcons.apps, title: 'Single Sign-On Hub', desc: 'Launch all assigned daily tools securely with single sign-on.' },
      { iconSvg: astryxIcons.sparkles, title: 'Elevated Access Tools', desc: 'Discover organization software and request access from your lead.' },
      { iconSvg: astryxIcons.zap, title: 'Pinned Favorites', desc: 'Quickly access your most frequently used everyday applications.' },
    ],
    nextSteps: ['Connect real-time access approval notifications', 'Add department-curated app bundles', 'Telemetry usage analytics'],
  },
  {
    id: 'profile',
    title: 'My Profile & Account',
    category: 'Workspace',
    iconSvg: astryxIcons.user,
    badge: 'Personal Space',
    summary: 'Personal page to view and update details, display name, contact info, working hours, active sessions, and theme preferences.',
    targetAudience: 'Individual User',
    features: [
      { iconSvg: astryxIcons.settings, title: 'Profile Customization', desc: 'Update display name, avatar photo, bio, and department info.' },
      { iconSvg: astryxIcons.shield, title: 'Security & Active Sessions', desc: 'View active browser logins and revoke old sessions with one click.' },
      { iconSvg: astryxIcons.key, title: 'Personal API Tokens', desc: 'Generate scoped API tokens for CLI tools and developer scripts.' },
    ],
    nextSteps: ['Profile photo upload integration', 'Session revocation endpoint', 'Personal token generator'],
  },
  {
    id: 'notifications',
    title: 'Notifications & Announcements',
    category: 'Workspace',
    iconSvg: astryxIcons.bell,
    badge: 'Inbox',
    summary: 'A centralized inbox for company-wide announcements, team updates, role modifications, and system alerts.',
    targetAudience: 'All Employees & Staff',
    features: [
      { iconSvg: astryxIcons.bell, title: 'Company Announcements', desc: 'Important broadcast messages and policy updates from leadership and HR.' },
      { iconSvg: astryxIcons.zap, title: 'Activity Alerts', desc: 'Notifications when someone mentions you or when your requests are approved.' },
      { iconSvg: astryxIcons.mail, title: 'Unread Management', desc: 'Mark notifications as read or filter by high-priority action items.' },
    ],
    nextSteps: ['Broadcast announcement composer', 'Real-time WebSocket event listener', 'Email digest preferences'],
  },

  // ── Admin Console Views ──
  {
    id: 'admin-members',
    title: 'Team & Member Management',
    category: 'Admin Console',
    iconSvg: astryxIcons.users,
    badge: 'Admin Suite',
    summary: 'Dashboard to invite new employees, deactivate accounts, assign job titles, and grant access levels.',
    targetAudience: 'Admins & HR Managers',
    features: [
      { iconSvg: astryxIcons.mail, title: 'Invite New Employees', desc: 'Send email invitations with pre-configured department, role, and manager.' },
      { iconSvg: astryxIcons.shield, title: 'Role & RBAC Assignment', desc: 'Assign Employee, Manager, HR Admin, or Super Admin roles in one click.' },
      { iconSvg: astryxIcons.slash, title: 'Instant Offboarding', desc: 'Immediately revoke system access and active sessions when an employee departs.' },
    ],
    nextSteps: ['Invite member modal workflow', 'Role assignment dropdown integration', 'CSV batch member import'],
  },
  {
    id: 'admin-apps',
    title: 'App Store & Permissions',
    category: 'Admin Console',
    iconSvg: astryxIcons.layers,
    badge: 'Admin Suite',
    summary: 'Admin panel to register new mini-apps, assign tools to specific departments, and manage access policies.',
    targetAudience: 'Admins & IT Leads',
    features: [
      { iconSvg: astryxIcons.apps, title: 'App Catalog Registry', desc: 'Register internal Forge micro-apps with dedicated ports and ingress URLs.' },
      { iconSvg: astryxIcons.filter, title: 'Department Scoping', desc: 'Limit sensitive tools (e.g. Finance/HR) to authorized departments only.' },
      { iconSvg: astryxIcons.key, title: 'Connector & API Keys', desc: 'Manage environment variables and API integrations per micro-app.' },
    ],
    nextSteps: ['App registration form', 'Department permission matrix', 'App health & uptime metrics'],
  },
  {
    id: 'admin-org',
    title: 'Organization Chart Builder',
    category: 'Admin Console',
    iconSvg: astryxIcons.gitTree,
    badge: 'Admin Suite',
    summary: 'Visual builder to create new departments, add teams, and update manager-employee reporting lines.',
    targetAudience: 'Admins & HR Leads',
    features: [
      { iconSvg: astryxIcons.topology, title: 'Drag & Drop Editor', desc: 'Reorganize teams and reporting chains visually on the 2D canvas.' },
      { iconSvg: astryxIcons.building, title: 'Department Creator', desc: 'Create new business units, assign budget codes, and designate team leads.' },
      { iconSvg: astryxIcons.check, title: 'Publish Changes', desc: 'Draft reorganization changes privately and publish live to the company.' },
    ],
    nextSteps: ['Draft vs Published org versioning', 'Canvas node drag-to-reparent', 'Team hierarchy export'],
  },
  {
    id: 'admin-audit',
    title: 'Security & Audit Logs',
    category: 'Admin Console',
    iconSvg: astryxIcons.fileText,
    badge: 'Admin Suite',
    summary: 'A security timeline tracking who logged in, who made organizational changes, and when critical settings were updated.',
    targetAudience: 'Admins & Security Officers',
    features: [
      { iconSvg: astryxIcons.search, title: 'Live Audit Stream', desc: 'Structured JSON log viewer (RFC 7807) with trace ID search and filtering.' },
      { iconSvg: astryxIcons.shield, title: 'PII Redacted Logs', desc: 'Sensitive credentials and passwords automatically redacted before logging.' },
      { iconSvg: astryxIcons.traffic, title: 'Access Analytics', desc: 'Monitor login trends, failed authentication attempts, and permission changes.' },
    ],
    nextSteps: ['Structured log filter by severity', 'Export audit logs to CSV/JSON', 'Security alert webhooks'],
  },
  {
    id: 'admin-settings',
    title: 'Company Settings & Security',
    category: 'Admin Console',
    iconSvg: astryxIcons.settings,
    badge: 'Admin Suite',
    summary: 'High-level workspace settings, company branding, enterprise single sign-on (SSO) setup, and domain policies.',
    targetAudience: 'Super Admins & Workspace Owners',
    features: [
      { iconSvg: astryxIcons.building, title: 'Company Identity & Branding', desc: 'Set company legal name, logo, custom portal domain, and timezone.' },
      { iconSvg: astryxIcons.key, title: 'SSO & OAuth Providers', desc: 'Configure Enterprise OIDC, SAML 2.0, and OAuth federated logins.' },
      { iconSvg: astryxIcons.database, title: 'Database & Backup Hub', desc: 'Inspect Turso libSQL connection state and manage isolated app databases.' },
    ],
    nextSteps: ['Company logo upload handler', 'SSO configuration form', 'Turso DB status check'],
  },
];

/**
 * renderPageCards
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function renderPageCards(user?: HeaderUserContext): string {
  const userContext: HeaderUserContext = {
    id: user?.id || 'usr_guest',
    email: user?.email || 'employee@forge.internal',
    displayName: user?.displayName || 'Authorized Member',
    roles: user?.roles || ['roles/employee'],
    isAdmin: user !== undefined ? (user.isAdmin ?? Boolean(user.roles?.some(r => r.includes('admin') || r.includes('manager')))) : true,
  };

  return `
    ${renderCanvasView()}
    ${renderAppsView(userContext.roles)}
    ${renderProfileView(userContext)}
    ${renderInboxView(userContext)}
    ${userContext.isAdmin ? `
      ${renderAdminMembersView()}
      ${renderAdminAppsView()}
      ${renderAdminOrgView()}
      ${renderAdminAuditView()}
      ${renderAdminSettingsView()}
    ` : ''}
  `;
}
