/**
 * @forge/dev-dashboard - Organization Setup API Handlers (2026 LTS)
 * Proxies Org Profile, Dynamic Levels, Department Nodes, and Sequential EID to @forge/auth via @forge/sdk.
 * @requirements [HLR-DEV-501] [LLR-SUB-002] [LLR-AUTH-009]
 */

import {
  fetchOrgSetupData,
  updateOrgProfileApi,
  updateOrgEidConfigApi,
  generateNextEidApi,
  previewNextEidApi,
  upsertOrgNodeTypeApi,
  deleteOrgNodeTypeApi,
  upsertOrgNodeApi,
  deleteOrgNodeApi,
} from '@forge/sdk';

/**
 * handleDevOrgSetupApi
 * @requirements [HLR-DEV-501] [LLR-SUB-002] [LLR-AUTH-009]
 */
export async function handleDevOrgSetupApi(path: string, req: Request, url: URL): Promise<Response | null> {
  // 1. Fetch Complete Org Setup Data (Profile, Node Types, Nodes)
  if (path === '/api/org-setup' && req.method === 'GET') {
    try {
      const data = await fetchOrgSetupData();
      return Response.json(data);
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to fetch org setup' }, { status: 500 });
    }
  }

  // 2. Update Organization Identity Profile
  if (path === '/api/org-setup/profile' && req.method === 'POST') {
    try {
      const body: any = await req.json().catch(() => null);
      if (!body) return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
      const res = await updateOrgProfileApi(body);
      return Response.json(res);
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to update org profile' }, { status: 400 });
    }
  }

  // 3. Update EID Format Configuration
  if (path === '/api/org-setup/eid-config' && req.method === 'POST') {
    try {
      const body: any = await req.json().catch(() => null);
      if (!body) return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
      const res = await updateOrgEidConfigApi(body);
      return Response.json(res);
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to update EID config' }, { status: 400 });
    }
  }

  // 4. Generate / Reserve Next Sequential EID
  if (path === '/api/org-setup/eid/next' && req.method === 'POST') {
    try {
      const res = await generateNextEidApi();
      return Response.json(res);
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to allocate next EID' }, { status: 500 });
    }
  }

  // 5. Preview Formatted EID without incrementing counter
  if ((path === '/api/org-setup/eid/preview') && (req.method === 'GET' || req.method === 'POST')) {
    try {
      const res = await previewNextEidApi();
      return Response.json(res);
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to preview EID' }, { status: 500 });
    }
  }

  // 6. Upsert Hierarchy Level Type
  if (path === '/api/org-setup/node-types' && req.method === 'POST') {
    try {
      const body: any = await req.json().catch(() => null);
      if (!body) return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
      const res = await upsertOrgNodeTypeApi(body);
      const statusCode = !body.id ? 201 : 200;
      return Response.json(res, { status: statusCode });
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to save hierarchy level' }, { status: 400 });
    }
  }

  // 7. Delete Hierarchy Level Type
  if (path.startsWith('/api/org-setup/node-types/') && req.method === 'DELETE') {
    const typeId = path.split('/').pop() || '';
    try {
      const res = await deleteOrgNodeTypeApi(typeId);
      return Response.json(res);
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to delete hierarchy level' }, { status: 409 });
    }
  }

  // 8. Upsert Department / Structural Unit Node
  if (path === '/api/org-setup/nodes' && req.method === 'POST') {
    try {
      const body: any = await req.json().catch(() => null);
      if (!body) return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
      const res = await upsertOrgNodeApi(body);
      const statusCode = !body.id ? 201 : 200;
      return Response.json(res, { status: statusCode });
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to save department unit' }, { status: 400 });
    }
  }

  // 9. Delete Department Node
  if (path.startsWith('/api/org-setup/nodes/') && req.method === 'DELETE') {
    const nodeId = path.split('/').pop() || '';
    try {
      const res = await deleteOrgNodeApi(nodeId);
      return Response.json(res);
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to delete department unit' }, { status: 409 });
    }
  }

  return null;
}
