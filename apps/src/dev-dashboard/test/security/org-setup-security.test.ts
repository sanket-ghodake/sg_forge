/**
 * @forge/dev-dashboard - Security Tests: Organization Setup Invariants & Boundary Defense (3A Pattern)
 * Validates circular dependency defense, cascade block protection, and RFC 7807 problem json envelopes.
 * @requirements [HLR-AUTH-102] [LLR-DB-005] [LLR-AUTH-009]
 */

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import {
  handleUpsertNode,
  handleDeleteNode,
  handleDeleteNodeType,
  handleUpsertNodeType,
} from '@forge/auth/backend/api-org-setup-handlers';
import { employeeController } from '@forge/auth/backend/employee-controller';
import { seedAuthDatabase } from '@forge/auth/db/seed';

describe('Tier 3 Security: Organization Setup Integrity & Cascade Defense', () => {
  beforeAll(() => {
    seedAuthDatabase(true);
  });

  afterAll(() => {
    seedAuthDatabase(true);
  });

  let testTypeId = '';
  let parentNodeId = '';
  let childNodeId = '';

  it('1. Blocks circular hierarchy references when department attempts to set itself as parent', async () => {
    // Arrange: Create level and node
    const typeRes: any = await (
      await handleUpsertNodeType(
        new Request('http://localhost/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Security Tier', level_order: 1 }),
        })
      )
    ).json();
    testTypeId = typeRes.nodeType.id;

    const nodeRes: any = await (
      await handleUpsertNode(
        new Request('http://localhost/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Parent Unit', type_id: testTypeId }),
        })
      )
    ).json();
    parentNodeId = nodeRes.node.id;

    // Act: Attempt to set itself as its own parent
    const circularRes = await handleUpsertNode(
      new Request('http://localhost/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parentNodeId, name: 'Parent Unit', type_id: testTypeId, parent_id: parentNodeId }),
      })
    );

    // Assert: HTTP 400 Bad Request
    expect(circularRes.status).toBe(400);
    const json: any = await circularRes.json();
    expect(json.detail).toContain('cannot be its own parent');
  });

  it('2. Blocks indirect circular dependency when parent attempts to set descendant as parent', async () => {
    // Arrange: Create child unit under parentNodeId
    const childRes: any = await (
      await handleUpsertNode(
        new Request('http://localhost/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Child Unit', type_id: testTypeId, parent_id: parentNodeId }),
        })
      )
    ).json();
    childNodeId = childRes.node.id;

    // Act: Attempt to update parentNode to have childNode as its parent (A -> B -> A)
    const circularDescendantRes = await handleUpsertNode(
      new Request('http://localhost/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parentNodeId, name: 'Parent Unit', type_id: testTypeId, parent_id: childNodeId }),
      })
    );

    // Assert: HTTP 400 Bad Request with circular hierarchy detection
    expect(circularDescendantRes.status).toBe(400);
    const json: any = await circularDescendantRes.json();
    expect(json.detail).toContain('Circular hierarchy detected');
  });

  it('3. Prevents deletion of hierarchy level tier when referenced by department nodes', () => {
    // Act: Attempt to delete testTypeId while parentNode and childNode reference it
    const deleteTypeRes = handleDeleteNodeType(new Request('http://localhost/'), testTypeId);

    // Assert: HTTP 409 Conflict
    expect(deleteTypeRes.status).toBe(409);
  });

  it('4. Prevents deletion of department unit when it contains child sub-units', () => {
    // Act: Attempt to delete parentNodeId while childNodeId references it as parent
    const deleteNodeRes = handleDeleteNode(new Request('http://localhost/'), parentNodeId);

    // Assert: HTTP 409 Conflict
    expect(deleteNodeRes.status).toBe(409);
  });

  it('5. Prevents deletion of department unit when active employees are assigned to it', () => {
    // Arrange: Create an employee assigned to childNodeId
    const email = `sec.test.${Date.now()}@forge.internal`;
    employeeController.createEmployee({
      display_name: 'Dept Test Member',
      email,
      job_title: 'Unit Specialist',
      role: 'roles/employee',
      status: 'ACTIVE',
      department_id: childNodeId,
    });

    // Act: Attempt to delete childNodeId
    const deleteNodeRes = handleDeleteNode(new Request('http://localhost/'), childNodeId);

    // Assert: HTTP 409 Conflict
    expect(deleteNodeRes.status).toBe(409);
  });
});
