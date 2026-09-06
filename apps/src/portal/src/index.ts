/**
 * @forge/portal
 * Main workspace portal: Org Canvas, App Catalog, and Admin Panel (2026 LTS).
 */

export * from './server';
export * from './frontend';

/**
 * portalService
 * @requirements [HLR-PORTAL-201] [LLR-SUB-006]
 */
export const portalService = {
  name: 'portal',
  status: 'ready',
};
