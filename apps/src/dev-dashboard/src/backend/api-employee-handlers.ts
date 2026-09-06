/**
 * @forge/dev-dashboard - Employee Studio API Handlers (2026 LTS)
 * Proxies and delegates Employee & Org Directory operations to @forge/auth via @forge/sdk.
 */

import {
  fetchEmployeesList,
  fetchEmployeeHierarchy,
  createEmployeeApi,
  updateEmployeeApi,
  revokeEmployeeSessionsApi,
  batchImportEmployeesApi,
  bulkActionEmployeesApi,
  fetchOrgTree,
} from '@forge/sdk';

/**
 * handleDevEmployeeApi
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export async function handleDevEmployeeApi(path: string, req: Request, url: URL): Promise<Response | null> {
  // 1. Employee Studio - List & Filter (Delegated to @forge/auth)
  if (path === '/api/employees' && req.method === 'GET') {
    try {
      const search = url.searchParams.get('search') || undefined;
      const departmentId = url.searchParams.get('departmentId') || undefined;
      const status = url.searchParams.get('status') || undefined;
      const limit = Number(url.searchParams.get('limit') || 50);
      const offset = Number(url.searchParams.get('offset') || 0);

      const result = await fetchEmployeesList({ search, departmentId, status, limit, offset });
      return Response.json(result);
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to list employees' }, { status: 500 });
    }
  }

  // 2. Employee Hierarchy Lookup
  if (path === '/api/employees/hierarchy' && req.method === 'GET') {
    const userId = url.searchParams.get('userId');
    if (!userId) return Response.json({ error: 'Missing userId parameter' }, { status: 400 });
    try {
      const result = await fetchEmployeeHierarchy(userId);
      return Response.json(result);
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Employee not found' }, { status: 404 });
    }
  }

  // 3. Create Single Employee
  if (path === '/api/employees' && req.method === 'POST') {
    try {
      const body: any = await req.json().catch(() => null);
      if (!body) return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
      const created = await createEmployeeApi(body);
      return Response.json(created, { status: 201 });
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to create employee' }, { status: 400 });
    }
  }

  // 4. Update Single Employee
  if (path === '/api/employees/update' && req.method === 'POST') {
    try {
      const body: any = await req.json().catch(() => null);
      if (!body || !body.id) return Response.json({ error: 'Missing employee ID' }, { status: 400 });
      const updated = await updateEmployeeApi(body.id, body);
      return Response.json(updated);
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to update employee' }, { status: 400 });
    }
  }

  // 5. Revoke Employee Active Sessions
  if (path === '/api/employees/revoke' && req.method === 'POST') {
    try {
      const body: any = await req.json().catch(() => null);
      if (!body || !body.id) return Response.json({ error: 'Missing employee ID' }, { status: 400 });
      const revoked = await revokeEmployeeSessionsApi(body.id);
      return Response.json(revoked);
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to revoke sessions' }, { status: 400 });
    }
  }

  // 6. Bulk Import Employees (CSV / JSON)
  if (path === '/api/employees/import' && req.method === 'POST') {
    try {
      const body: any = await req.json().catch(() => null);
      if (!body || !Array.isArray(body.records)) {
        return Response.json({ error: 'Invalid payload: records array is required' }, { status: 400 });
      }
      const summary = await batchImportEmployeesApi(body.records, body.options || {});
      return Response.json(summary);
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Bulk import failed' }, { status: 400 });
    }
  }

  // 7. Export Employees
  if (path === '/api/employees/export' && req.method === 'GET') {
    try {
      const format = url.searchParams.get('format') || 'csv';
      const data = await fetchEmployeesList({
        search: url.searchParams.get('search') || undefined,
        departmentId: url.searchParams.get('departmentId') || undefined,
        status: url.searchParams.get('status') || undefined,
        limit: 5000,
        offset: 0,
      });

      if (format === 'json') {
        return new Response(JSON.stringify(data.items, null, 2), {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Disposition': `attachment; filename="employees_export_${Date.now()}.json"`,
          },
        });
      }

      const headers = ['id', 'display_name', 'email', 'job_title', 'employee_code', 'department_name', 'manager_email', 'status', 'roles'];
      const csv =
        headers.join(',') +
        '\n' +
        data.items
          .map((item) =>
            [
              JSON.stringify(item.id || ''),
              JSON.stringify(item.display_name || ''),
              JSON.stringify(item.email || ''),
              JSON.stringify(item.job_title || ''),
              JSON.stringify(item.employee_code || ''),
              JSON.stringify(item.department_name || ''),
              JSON.stringify(item.manager_email || ''),
              JSON.stringify(item.status || ''),
              JSON.stringify((item.roles || []).join('; ')),
            ].join(',')
          )
          .join('\n');

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="employees_export_${Date.now()}.csv"`,
        },
      });
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Export failed' }, { status: 500 });
    }
  }

  // 8. Employee Org Graph Tree
  if (path === '/api/employees/tree' && req.method === 'GET') {
    try {
      const tree: any = await fetchOrgTree({ maxDepth: 20 });
      const roots = tree.roots || (tree.root ? [tree.root] : []);
      return Response.json({ status: 'ok', ok: true, data: tree, roots, root: tree.root, total: tree.totalEmployees || 0 });
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Failed to fetch tree' }, { status: 500 });
    }
  }

  // 9. Employee Bulk Action
  if (path === '/api/employees/bulk-action' && req.method === 'POST') {
    try {
      const body = await req.json();
      const res = await bulkActionEmployeesApi(body.action, body.userIds, { orgId: body.orgId });
      return Response.json(res);
    } catch (err: any) {
      return Response.json({ error: err?.message || 'Bulk action failed' }, { status: 400 });
    }
  }

  return null;
}
