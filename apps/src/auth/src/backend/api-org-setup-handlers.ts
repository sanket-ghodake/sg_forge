/**
 * @forge/auth - Organization Setup & Hierarchy API Handlers (2026 LTS)
 * Live database persistence for Org Profile, Dynamic Hierarchy Tiers, Department Nodes, and Sequential EID.
 * @requirements [HLR-AUTH-102] [LLR-DB-005] [LLR-AUTH-009]
 */

import { randomBytes } from 'node:crypto';
import { createLogger } from '@forge/sdk';
import { getAuthDb } from '../db/db';

const logger = createLogger('auth-org-setup-api');

function problem(title: string, detail: string, status: number = 400, traceId?: string): Response {
  return Response.json(
    {
      type: 'https://tools.ietf.org/html/rfc7807',
      title,
      status,
      detail,
      ...(traceId ? { traceId } : {}),
    },
    {
      status,
      headers: {
        'Content-Type': 'application/problem+json',
        ...(traceId ? { 'x-trace-id': traceId } : {}),
      },
    }
  );
}

function getActiveOrgId(db: any): string {
  const row: any = db.query('SELECT id FROM auth_organizations LIMIT 1;').get();
  if (row && row.id) return row.id;
  const newId = 'org-sg-forge-global';
  const now = Date.now();
  db.run(
    `INSERT INTO auth_organizations (id, name, domain, brand_name, brand_tagline, eid_prefix, eid_padding, eid_counter, timezone, settings, created_at, updated_at)
     VALUES (?, 'SG Forge Enterprise', 'forge.internal', 'SG Forge', 'Unified Engineering Studio', 'EMP', 4, 0, 'UTC', '{}', ?, ?);`,
    [newId, now, now]
  );
  return newId;
}

/**
 * Handle GET /api/v1/auth/org/setup
 * @requirements [HLR-AUTH-102] [LLR-AUTH-009]
 */
export function handleGetOrgSetup(req: Request): Response {
  try {
    const db = getAuthDb();
    const orgId = getActiveOrgId(db);

    const organization: any = db.query('SELECT * FROM auth_organizations WHERE id = ?;').get(orgId);
    const nodeTypes: any[] = db.query('SELECT * FROM auth_org_node_types WHERE org_id = ? ORDER BY level_order ASC;').all(orgId);
    const nodes: any[] = db.query(`
      SELECT n.*, t.name as type_name, t.level_order,
        (SELECT COUNT(*) FROM auth_employee_profiles WHERE org_node_id = n.id) as employee_count,
        (SELECT COUNT(*) FROM auth_org_nodes WHERE parent_id = n.id) as child_count
      FROM auth_org_nodes n
      JOIN auth_org_node_types t ON n.type_id = t.id
      WHERE n.org_id = ?
      ORDER BY t.level_order ASC, n.name ASC;
    `).all(orgId);

    return Response.json({
      ok: true,
      status: 'ok',
      organization,
      nodeTypes,
      nodes,
    });
  } catch (err: any) {
    logger.error('Failed to get org setup:', err);
    return problem('Internal Server Error', err?.message || 'Failed to retrieve org setup', 500);
  }
}

/**
 * Handle POST /api/v1/auth/org/setup/profile
 * @requirements [HLR-AUTH-102] [LLR-AUTH-009]
 */
export async function handleUpdateOrgProfile(req: Request): Promise<Response> {
  try {
    const body: any = await req.json().catch(() => null);
    if (!body || !body.name || !body.domain) {
      return problem('Bad Request', 'name and domain are required fields', 400);
    }

    const db = getAuthDb();
    const orgId = getActiveOrgId(db);
    const now = Date.now();

    db.run(
      `UPDATE auth_organizations
       SET name = ?, domain = ?, brand_name = ?, brand_tagline = ?, timezone = ?, contact_email = ?, updated_at = ?
       WHERE id = ?;`,
      [
        body.name.trim(),
        body.domain.trim().toLowerCase(),
        body.brand_name ? body.brand_name.trim() : null,
        body.brand_tagline ? body.brand_tagline.trim() : null,
        body.timezone || 'UTC',
        body.contact_email ? body.contact_email.trim() : null,
        now,
        orgId,
      ]
    );

    const updated = db.query('SELECT * FROM auth_organizations WHERE id = ?;').get(orgId);
    return Response.json({ ok: true, status: 'ok', organization: updated });
  } catch (err: any) {
    logger.error('Failed to update org profile:', err);
    return problem('Bad Request', err?.message || 'Failed to update org profile', 400);
  }
}

/**
 * Handle POST /api/v1/auth/org/setup/eid-config
 * @requirements [HLR-AUTH-102] [LLR-AUTH-009]
 */
export async function handleUpdateEidConfig(req: Request): Promise<Response> {
  try {
    const body: any = await req.json().catch(() => null);
    if (!body) return problem('Bad Request', 'Invalid JSON body', 400);

    const db = getAuthDb();
    const orgId = getActiveOrgId(db);
    const prefix = (body.prefix || 'EMP').trim().toUpperCase();
    const padding = Math.min(Math.max(Number(body.padding) || 4, 2), 8);
    const counter = typeof body.counter === 'number' ? Math.max(0, body.counter) : undefined;
    const now = Date.now();

    if (counter !== undefined) {
      db.run(
        `UPDATE auth_organizations SET eid_prefix = ?, eid_padding = ?, eid_counter = ?, updated_at = ? WHERE id = ?;`,
        [prefix, padding, counter, now, orgId]
      );
    } else {
      db.run(
        `UPDATE auth_organizations SET eid_prefix = ?, eid_padding = ?, updated_at = ? WHERE id = ?;`,
        [prefix, padding, now, orgId]
      );
    }

    const org: any = db.query('SELECT eid_prefix, eid_padding, eid_counter FROM auth_organizations WHERE id = ?;').get(orgId);
    const preview = `${org.eid_prefix}-${String((org.eid_counter || 0) + 1).padStart(org.eid_padding || 4, '0')}`;

    return Response.json({ ok: true, status: 'ok', config: org, preview });
  } catch (err: any) {
    logger.error('Failed to update EID config:', err);
    return problem('Bad Request', err?.message || 'Failed to update EID config', 400);
  }
}

/**
 * Handle POST /api/v1/auth/org/setup/eid/next
 * Atomically reserves and increments the next sequential EID.
 * @requirements [HLR-AUTH-102] [LLR-AUTH-009]
 */
export function handleGetNextEid(req: Request): Response {
  try {
    const db = getAuthDb();
    const orgId = getActiveOrgId(db);
    const now = Date.now();

    let nextEid = '';
    let counterVal = 1;

    db.transaction(() => {
      const org: any = db.query('SELECT eid_prefix, eid_padding, eid_counter FROM auth_organizations WHERE id = ?;').get(orgId);
      const prefix = org?.eid_prefix || 'EMP';
      const padding = org?.eid_padding || 4;
      counterVal = (org?.eid_counter || 0) + 1;

      db.run('UPDATE auth_organizations SET eid_counter = ?, updated_at = ? WHERE id = ?;', [counterVal, now, orgId]);
      nextEid = `${prefix}-${String(counterVal).padStart(padding, '0')}`;
    })();

    return Response.json({ ok: true, status: 'ok', eid: nextEid, counter: counterVal });
  } catch (err: any) {
    logger.error('Failed to generate next EID:', err);
    return problem('Internal Server Error', err?.message || 'Failed to allocate sequential EID', 500);
  }
}

/**
 * Handle POST /api/v1/auth/org/setup/eid/preview
 * @requirements [HLR-AUTH-102] [LLR-AUTH-009]
 */
export function handlePreviewEid(req: Request): Response {
  try {
    const db = getAuthDb();
    const orgId = getActiveOrgId(db);
    const org: any = db.query('SELECT eid_prefix, eid_padding, eid_counter FROM auth_organizations WHERE id = ?;').get(orgId);
    const prefix = org?.eid_prefix || 'EMP';
    const padding = org?.eid_padding || 4;
    const nextVal = (org?.eid_counter || 0) + 1;
    const preview = `${prefix}-${String(nextVal).padStart(padding, '0')}`;
    return Response.json({ ok: true, status: 'ok', preview, nextCounter: nextVal });
  } catch (err: any) {
    return problem('Internal Server Error', err?.message || 'Failed to preview EID', 500);
  }
}

/**
 * Handle POST /api/v1/auth/org/setup/node-types
 * @requirements [HLR-AUTH-102] [LLR-AUTH-009]
 */
export async function handleUpsertNodeType(req: Request): Promise<Response> {
  try {
    const body: any = await req.json().catch(() => null);
    if (!body || !body.name || typeof body.level_order !== 'number') {
      return problem('Bad Request', 'name and numeric level_order are required', 400);
    }

    const db = getAuthDb();
    const orgId = getActiveOrgId(db);
    const typeId = body.id || `type-${randomBytes(4).toString('hex')}`;

    if (body.id) {
      db.run(
        `UPDATE auth_org_node_types SET name = ?, level_order = ?, description = ? WHERE id = ? AND org_id = ?;`,
        [body.name.trim(), body.level_order, body.description ? body.description.trim() : null, typeId, orgId]
      );
    } else {
      db.run(
        `INSERT INTO auth_org_node_types (id, org_id, name, level_order, description) VALUES (?, ?, ?, ?, ?);`,
        [typeId, orgId, body.name.trim(), body.level_order, body.description ? body.description.trim() : null]
      );
    }

    const row = db.query('SELECT * FROM auth_org_node_types WHERE id = ?;').get(typeId);
    return Response.json({ ok: true, status: 'ok', nodeType: row }, { status: body.id ? 200 : 201 });
  } catch (err: any) {
    logger.error('Failed to upsert node type:', err);
    return problem('Bad Request', err?.message || 'Failed to upsert node type', 400);
  }
}

/**
 * Handle DELETE /api/v1/auth/org/setup/node-types/:id
 * @requirements [HLR-AUTH-102] [LLR-AUTH-009]
 */
export function handleDeleteNodeType(req: Request, typeId: string): Response {
  try {
    const db = getAuthDb();
    const orgId = getActiveOrgId(db);

    const nodeCount: any = db.query('SELECT COUNT(*) as count FROM auth_org_nodes WHERE type_id = ?;').get(typeId);
    if (nodeCount && nodeCount.count > 0) {
      return problem('Conflict', `Cannot delete level type because ${nodeCount.count} department nodes reference it. Reassign them first.`, 409);
    }

    db.run('DELETE FROM auth_org_node_types WHERE id = ? AND org_id = ?;', [typeId, orgId]);
    return Response.json({ ok: true, status: 'ok', message: 'Hierarchy level type deleted successfully' });
  } catch (err: any) {
    logger.error('Failed to delete node type:', err);
    return problem('Bad Request', err?.message || 'Failed to delete node type', 400);
  }
}

/**
 * Handle POST /api/v1/auth/org/setup/nodes
 * @requirements [HLR-AUTH-102] [LLR-AUTH-009]
 */
export async function handleUpsertNode(req: Request): Promise<Response> {
  try {
    const body: any = await req.json().catch(() => null);
    if (!body || !body.name || !body.type_id) {
      return problem('Bad Request', 'name and type_id are required fields', 400);
    }

    const db = getAuthDb();
    const orgId = getActiveOrgId(db);
    const nodeId = body.id || `node-${randomBytes(5).toString('hex')}`;
    const parentId = body.parent_id || null;
    const now = Date.now();

    // Circular dependency check
    if (body.id && parentId) {
      if (parentId === body.id) {
        return problem('Bad Request', 'A department node cannot be its own parent', 400);
      }
      let currParent: string | null = parentId;
      while (currParent) {
        if (currParent === body.id) {
          return problem('Bad Request', 'Circular hierarchy detected: cannot set parent to a descendant node', 400);
        }
        const pRow: any = db.query('SELECT parent_id FROM auth_org_nodes WHERE id = ?;').get(currParent);
        currParent = pRow ? pRow.parent_id : null;
      }
    }

    // Path calculation
    const slug = body.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    let computedPath = `/${slug}`;
    if (parentId) {
      const parentRow: any = db.query('SELECT path FROM auth_org_nodes WHERE id = ?;').get(parentId);
      if (parentRow && parentRow.path) {
        computedPath = `${parentRow.path}/${slug}`;
      }
    }

    if (body.id) {
      db.run(
        `UPDATE auth_org_nodes
         SET name = ?, code = ?, type_id = ?, parent_id = ?, path = ?, updated_at = ?
         WHERE id = ? AND org_id = ?;`,
        [body.name.trim(), body.code ? body.code.trim().toUpperCase() : null, body.type_id, parentId, computedPath, now, nodeId, orgId]
      );
    } else {
      db.run(
        `INSERT INTO auth_org_nodes (id, org_id, type_id, name, code, parent_id, path, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [nodeId, orgId, body.type_id, body.name.trim(), body.code ? body.code.trim().toUpperCase() : null, parentId, computedPath, now, now]
      );
    }

    const row = db.query('SELECT * FROM auth_org_nodes WHERE id = ?;').get(nodeId);
    return Response.json({ ok: true, status: 'ok', node: row }, { status: body.id ? 200 : 201 });
  } catch (err: any) {
    logger.error('Failed to upsert department node:', err);
    return problem('Bad Request', err?.message || 'Failed to upsert department node', 400);
  }
}

/**
 * Handle DELETE /api/v1/auth/org/setup/nodes/:id
 * @requirements [HLR-AUTH-102] [LLR-AUTH-009]
 */
export function handleDeleteNode(req: Request, nodeId: string): Response {
  try {
    const db = getAuthDb();
    const orgId = getActiveOrgId(db);

    const childCount: any = db.query('SELECT COUNT(*) as count FROM auth_org_nodes WHERE parent_id = ?;').get(nodeId);
    if (childCount && childCount.count > 0) {
      return problem('Conflict', `Cannot delete department because ${childCount.count} child sub-units belong to it. Remove or reassign them first.`, 409);
    }

    const empCount: any = db.query('SELECT COUNT(*) as count FROM auth_employee_profiles WHERE org_node_id = ?;').get(nodeId);
    if (empCount && empCount.count > 0) {
      return problem('Conflict', `Cannot delete department because ${empCount.count} active employees are assigned to it. Reassign employees first.`, 409);
    }

    db.run('DELETE FROM auth_org_nodes WHERE id = ? AND org_id = ?;', [nodeId, orgId]);
    return Response.json({ ok: true, status: 'ok', message: 'Department node deleted successfully' });
  } catch (err: any) {
    logger.error('Failed to delete department node:', err);
    return problem('Bad Request', err?.message || 'Failed to delete department node', 400);
  }
}
