/**
 * @forge/portal - Dynamic Forge Apps Catalog (2026 LTS)
 * 100% Dynamically driven by @forge/sdk service registry (.env)
 * Supports dynamic micro-app discovery, zero hardcoding, and RBAC-aware marketplace access.
 */

import { loadServiceRegistry, isAppDisabled, type ServiceEntry } from '@forge/sdk';
import { astryxIcons } from '@forge/ui';

/**
 * AppAdminInfo
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export interface AppAdminInfo {
  name: string;
  title: string;
  email: string;
  roleTag: string;
  avatarInitial: string;
}

/**
 * MicroAppItem
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export interface MicroAppItem {
  id: string;
  name: string;
  category: string;
  description: string;
  ingressPath: string;
  port: number;
  iconSvg: string;
  status: 'ONLINE' | 'DEGRADED' | 'MAINTENANCE';
  latencyMs?: number;
  isPinned?: boolean;
  requiredRole?: string;
  isRestricted?: boolean;
  departmentOwner?: string;
  approvalType?: string;
  tags?: string[];
  admins?: AppAdminInfo[];
}

/**
 * Curated metadata enhancements for standard apps
 */
const KNOWN_APP_METADATA: Record<string, Partial<MicroAppItem>> = {
  expenses: {
    category: 'Finance',
    description: 'Submit employee expense claims, upload receipts, track mileage, and review payment status.',
    departmentOwner: 'Finance Team',
    tags: ['Reimbursements', 'Receipts', 'SSO Active'],
    isPinned: true,
    admins: [
      { name: 'Sarah Chen', title: 'VP of Finance & Operations', email: 'sarah.chen@forge.internal', roleTag: 'App Owner', avatarInitial: 'SC' },
      { name: 'Priya Sharma', title: 'People & Payroll Ops Lead', email: 'priya.sharma@forge.internal', roleTag: 'Finance Admin', avatarInitial: 'PS' },
    ],
  },
  billing: {
    category: 'Finance',
    description: 'Customer invoice ledger, subscription management, payment reconciliation, and fiscal reporting.',
    departmentOwner: 'Finance & Treasury',
    approvalType: 'Finance Lead Approval',
    tags: ['Invoicing', 'Subscriptions', 'Ledger'],
    isRestricted: true,
    admins: [
      { name: 'Sarah Chen', title: 'VP of Finance & Operations', email: 'sarah.chen@forge.internal', roleTag: 'App Owner', avatarInitial: 'SC' },
      { name: 'Elena Rostova', title: 'Controller & Treasury Admin', email: 'elena.rostova@forge.internal', roleTag: 'Billing Admin', avatarInitial: 'ER' },
    ],
  },
  telemetry: {
    category: 'Operations',
    description: 'Deep distributed request tracing, raw cluster telemetry, error log aggregation, and real-time APM.',
    departmentOwner: 'Infrastructure & SRE',
    approvalType: 'Security & IT Approval',
    tags: ['Distributed Traces', 'APM', 'Logs'],
    isRestricted: true,
    admins: [
      { name: 'Alex Rivera', title: 'Principal SRE & Observability Lead', email: 'alex.rivera@forge.internal', roleTag: 'App Owner', avatarInitial: 'AR' },
      { name: 'Marcus Vance', title: 'Cloud Infrastructure & Security Lead', email: 'marcus.vance@forge.internal', roleTag: 'IT Approver', avatarInitial: 'MV' },
    ],
  },
  code: {
    category: 'Engineering',
    description: 'Cloud developer workspace, Git code review, sandbox runtimes, and CI/CD deployment pipelines.',
    departmentOwner: 'Engineering & Platform',
    approvalType: 'Engineering Lead Approval',
    tags: ['Workspaces', 'Git Repos', 'Pipelines'],
    admins: [
      { name: 'David Kross', title: 'Head of Platform Engineering', email: 'david.kross@forge.internal', roleTag: 'App Owner', avatarInitial: 'DK' },
      { name: 'Jordan Taylor', title: 'DevOps & Tooling Architect', email: 'jordan.taylor@forge.internal', roleTag: 'Platform Admin', avatarInitial: 'JT' },
    ],
  },
};

/**
 * Select a clean Astryx SVG stroke icon based on category
 */
function getCategoryIcon(category: string): string {
  const cat = (category || '').toLowerCase();
  if (cat.includes('finance') || cat.includes('bill') || cat.includes('expense')) {
    return astryxIcons.table || astryxIcons.layers;
  }
  if (cat.includes('operation') || cat.includes('infra') || cat.includes('sre') || cat.includes('telemetry')) {
    return astryxIcons.cpu || astryxIcons.topology;
  }
  if (cat.includes('data') || cat.includes('storage') || cat.includes('db')) {
    return astryxIcons.database || astryxIcons.network;
  }
  if (cat.includes('dev') || cat.includes('tool') || cat.includes('code')) {
    return astryxIcons.apps || astryxIcons.services;
  }
  return astryxIcons.rocket || astryxIcons.layers;
}

export interface PortalAppsContext {
  department?: string;
  appBindings?: string[];
  livePolicies?: Record<string, {
    id: string;
    name: string;
    category: string;
    departmentOwner: string;
    approvalType: string;
    status: 'ONLINE' | 'STANDBY' | 'MAINTENANCE';
    description?: string;
  }>;
  liveAdmins?: Record<string, AppAdminInfo[]>;
}

/**
 * Dynamically discover and categorize all micro-apps from the service registry.
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function getPortalApps(
  userRoles: string[] = [],
  userContext?: PortalAppsContext
): {
  activeApps: MicroAppItem[];
  marketplaceApps: MicroAppItem[];
  allApps: MicroAppItem[];
} {
  const services = loadServiceRegistry({ includeDisabled: false });
  // Micro-apps are all non-core services with path under /apps/
  const microAppServices = services.filter((s) => s.path.startsWith('/apps/') && !isAppDisabled(s.id));

  const activeApps: MicroAppItem[] = [];
  const marketplaceApps: MicroAppItem[] = [];
  const allApps: MicroAppItem[] = [];

  const isAdmin = userRoles.some((r) => r.includes('admin') || r.includes('manager') || r.includes('lead'));
  const userDept = (userContext?.department || '').toLowerCase();
  const directGrants = new Set(userContext?.appBindings || []);
  const livePolicies = userContext?.livePolicies || {};
  const liveAdmins = userContext?.liveAdmins || {};

  for (const s of microAppServices) {
    const known = KNOWN_APP_METADATA[s.id] || {};
    const livePolicy = livePolicies[s.id];
    const roleLower = (s.role || '').toLowerCase();
    
    // An app is restricted if its role requires specific admin privileges that the current user lacks
    const requiresAdmin = roleLower.includes('admin') || roleLower.includes('restricted') || roleLower.includes('super_admin');
    let isRestricted = known.isRestricted !== undefined ? (known.isRestricted && !isAdmin) : (requiresAdmin && !isAdmin);

    // If user has direct approved policy binding, grant access immediately
    if (directGrants.has(s.id)) {
      isRestricted = false;
    } else if (userDept && known.departmentOwner && known.departmentOwner.toLowerCase().includes(userDept)) {
      isRestricted = false;
    }

    const category = livePolicy?.category || known.category || (s.category && !s.category.includes('Polyglot') ? s.category : 'Operations');
    const deptOwner = livePolicy?.departmentOwner || known.departmentOwner || `${category} Team`;
    const appStatus: 'ONLINE' | 'DEGRADED' | 'MAINTENANCE' = 
      livePolicy?.status === 'MAINTENANCE' ? 'MAINTENANCE' : 
      livePolicy?.status === 'STANDBY' ? 'DEGRADED' : 'ONLINE';

    const defaultAdmins: AppAdminInfo[] = [
      {
        name: `${deptOwner} Lead`,
        title: `Head of ${category}`,
        email: `leads@forge.internal`,
        roleTag: 'App Owner',
        avatarInitial: category.slice(0, 2).toUpperCase(),
      },
      {
        name: 'Workspace Security Officer',
        title: 'Platform Security & IAM',
        email: 'admin@forge.internal',
        roleTag: 'IT Approver',
        avatarInitial: 'SO',
      },
    ];

    const admins = (liveAdmins[s.id] && liveAdmins[s.id].length > 0)
      ? liveAdmins[s.id]
      : (known.admins || defaultAdmins);

    const item: MicroAppItem = {
      id: s.id,
      name: livePolicy?.name || s.name,
      category,
      description: livePolicy?.description || known.description || `Dedicated isolated ${s.name} microservice operating on container port ${s.port}.`,
      ingressPath: s.path,
      port: s.port,
      iconSvg: known.iconSvg || getCategoryIcon(category),
      status: appStatus,
      isPinned: Boolean(known.isPinned),
      requiredRole: s.role,
      isRestricted,
      departmentOwner: deptOwner,
      approvalType: livePolicy?.approvalType || known.approvalType || (requiresAdmin ? 'Admin Approval Required' : undefined),
      tags: known.tags || [category, `Port ${s.port}`, 'SSO Active'],
      admins,
    };

    allApps.push(item);
    if (isRestricted) {
      marketplaceApps.push(item);
    } else {
      activeApps.push(item);
    }
  }

  return { activeApps, marketplaceApps, allApps };
}

/** Backward compatibility exports  * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export const REGISTERED_PORTAL_APPS: MicroAppItem[] = getPortalApps(['roles/employee', 'roles/admin']).allApps;
/**
 * MARKETPLACE_APPS
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export const MARKETPLACE_APPS: MicroAppItem[] = getPortalApps([]).marketplaceApps;

