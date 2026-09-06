/**
 * @forge/portal - Dynamic Forge Apps Catalog (2026 LTS)
 * 100% Dynamically driven by @forge/sdk service registry (.env)
 * Supports dynamic micro-app discovery, zero hardcoding, and RBAC-aware marketplace access.
 */

import { loadServiceRegistry, isAppDisabled, type ServiceEntry } from '@forge/sdk';
import { astryxIcons } from '@forge/ui';

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
  },
  billing: {
    category: 'Finance',
    description: 'Customer invoice ledger, subscription management, payment reconciliation, and fiscal reporting.',
    departmentOwner: 'Finance Team',
    approvalType: 'Finance Lead Approval',
    tags: ['Invoicing', 'Subscriptions', 'Ledger'],
    isRestricted: true,
  },
  telemetry: {
    category: 'Operations',
    description: 'Deep distributed request tracing, raw cluster telemetry, error log aggregation, and real-time APM.',
    departmentOwner: 'Infrastructure & SRE',
    approvalType: 'Security & IT Approval',
    tags: ['Distributed Traces', 'APM', 'Logs'],
    isRestricted: true,
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

/**
 * Dynamically discover and categorize all micro-apps from the service registry.
  * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function getPortalApps(userRoles: string[] = []): {
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

  for (const s of microAppServices) {
    const known = KNOWN_APP_METADATA[s.id] || {};
    const roleLower = (s.role || '').toLowerCase();
    
    // An app is restricted if its role requires specific admin privileges that the current user lacks
    const requiresAdmin = roleLower.includes('admin') || roleLower.includes('restricted') || roleLower.includes('super_admin');
    const isRestricted = known.isRestricted !== undefined ? (known.isRestricted && !isAdmin) : (requiresAdmin && !isAdmin);
    const category = known.category || (s.category && !s.category.includes('Polyglot') ? s.category : 'Operations');

    const item: MicroAppItem = {
      id: s.id,
      name: s.name,
      category,
      description: known.description || `Dedicated isolated ${s.name} microservice operating on container port ${s.port}.`,
      ingressPath: s.path,
      port: s.port,
      iconSvg: known.iconSvg || getCategoryIcon(category),
      status: 'ONLINE',
      isPinned: Boolean(known.isPinned),
      requiredRole: s.role,
      isRestricted,
      departmentOwner: known.departmentOwner || `${category} Team`,
      approvalType: known.approvalType || (requiresAdmin ? 'Admin Approval Required' : undefined),
      tags: known.tags || [category, `Port ${s.port}`, 'SSO Active'],
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

