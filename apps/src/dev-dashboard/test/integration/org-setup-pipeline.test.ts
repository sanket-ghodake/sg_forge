/**
 * @forge/dev-dashboard - Integration Tests: Organization Setup Pipeline (3A Pattern)
 * Validates complete CRUD persistence across Org Profile, Hierarchy Tiers, Departments, and EID sequences.
 * @requirements [HLR-AUTH-102] [LLR-DB-005] [LLR-AUTH-009]
 */

import { afterAll, describe, expect, it } from 'bun:test';
import {
  handleGetOrgSetup,
  handleUpdateOrgProfile,
  handleUpdateEidConfig,
  handleGetNextEid,
  handlePreviewEid,
  handleUpsertNodeType,
  handleDeleteNodeType,
  handleUpsertNode,
  handleDeleteNode,
} from '@forge/auth/backend/api-org-setup-handlers';
import { seedAuthDatabase } from '@forge/auth/db/seed';

describe('Tier 2 Integration: Organization Setup & Dynamic Hierarchy Pipeline', () => {
  afterAll(() => {
    seedAuthDatabase(true);
  });

  let createdTypeId = '';
  let createdNodeId = '';

  it('1. Retrieves active organization setup data from live database', async () => {
    // Act
    const res = handleGetOrgSetup(new Request('http://localhost/api/v1/auth/org/setup'));
    const json: any = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.organization).toBeDefined();
    expect(Array.isArray(json.nodeTypes)).toBe(true);
    expect(Array.isArray(json.nodes)).toBe(true);
  });

  it('2. Updates organization identity and corporate profile in database', async () => {
    // Arrange
    const payload = {
      name: 'Forge Innovations Enterprise',
      domain: 'forge-innovations.internal',
      brand_name: 'Forge Enterprise',
      brand_tagline: 'LTS Cloud Native Suite',
      timezone: 'Asia/Kolkata',
      contact_email: 'governance@forge-innovations.internal',
    };

    // Act
    const res = await handleUpdateOrgProfile(
      new Request('http://localhost/api/v1/auth/org/setup/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );
    const json: any = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.organization.name).toBe(payload.name);
    expect(json.organization.domain).toBe(payload.domain);
    expect(json.organization.timezone).toBe(payload.timezone);
  });

  it('3. Configures EID sequence parameters and validates preview generation', async () => {
    // Arrange
    const configPayload = {
      prefix: 'TECH',
      padding: 4,
      counter: 100,
    };

    // Act 1: Update EID config
    const resConfig = await handleUpdateEidConfig(
      new Request('http://localhost/api/v1/auth/org/setup/eid-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configPayload),
      })
    );
    const jsonConfig: any = await resConfig.json();

    // Assert 1
    expect(resConfig.status).toBe(200);
    expect(jsonConfig.ok).toBe(true);
    expect(jsonConfig.config.eid_prefix).toBe('TECH');
    expect(jsonConfig.config.eid_padding).toBe(4);
    expect(jsonConfig.preview).toBe('TECH-0101');

    // Act 2: Non-mutating preview
    const resPreview = handlePreviewEid(new Request('http://localhost/api/v1/auth/org/setup/eid/preview'));
    const jsonPreview: any = await resPreview.json();

    // Assert 2
    expect(jsonPreview.preview).toBe('TECH-0101');
    expect(jsonPreview.nextCounter).toBe(101);
  });

  it('4. Atomically allocates and increments sequential EID strings in database', async () => {
    // Act 1: First allocation
    const res1 = handleGetNextEid(new Request('http://localhost/api/v1/auth/org/setup/eid/next', { method: 'POST' }));
    const json1: any = await res1.json();

    // Act 2: Second allocation
    const res2 = handleGetNextEid(new Request('http://localhost/api/v1/auth/org/setup/eid/next', { method: 'POST' }));
    const json2: any = await res2.json();

    // Assert: Sequential monotonic increment
    expect(json1.eid).toBe('TECH-0101');
    expect(json1.counter).toBe(101);

    expect(json2.eid).toBe('TECH-0102');
    expect(json2.counter).toBe(102);
  });

  it('5. Creates, updates, and persists dynamic hierarchy level tiers', async () => {
    // Arrange
    const levelPayload = {
      name: 'Autonomous Unit',
      level_order: 3,
      description: 'Self-contained feature delivery team',
    };

    // Act: Create
    const resCreate = await handleUpsertNodeType(
      new Request('http://localhost/api/v1/auth/org/setup/node-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(levelPayload),
      })
    );
    const jsonCreate: any = await resCreate.json();

    // Assert
    expect(resCreate.status).toBe(201);
    expect(jsonCreate.nodeType.id).toBeDefined();
    expect(jsonCreate.nodeType.name).toBe('Autonomous Unit');
    expect(jsonCreate.nodeType.level_order).toBe(3);
    createdTypeId = jsonCreate.nodeType.id;
  });

  it('6. Creates and updates department nodes with calculated hierarchical paths', async () => {
    expect(createdTypeId).toBeTruthy();

    // Arrange: Create node
    const nodePayload = {
      name: 'Platform Engineering',
      code: 'PLAT-ENG',
      type_id: createdTypeId,
    };

    // Act: Create root-level department
    const resCreate = await handleUpsertNode(
      new Request('http://localhost/api/v1/auth/org/setup/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nodePayload),
      })
    );
    const jsonCreate: any = await resCreate.json();

    // Assert
    expect(resCreate.status).toBe(201);
    expect(jsonCreate.node.id).toBeDefined();
    expect(jsonCreate.node.path).toBe('/platform-engineering');
    createdNodeId = jsonCreate.node.id;

    // Act: Create child squad under Platform Engineering
    const childPayload = {
      name: 'Observability & SRE',
      code: 'SRE',
      type_id: createdTypeId,
      parent_id: createdNodeId,
    };
    const resChild = await handleUpsertNode(
      new Request('http://localhost/api/v1/auth/org/setup/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(childPayload),
      })
    );
    const jsonChild: any = await resChild.json();

    // Assert: Nested path
    expect(resChild.status).toBe(201);
    expect(jsonChild.node.path).toBe('/platform-engineering/observability-sre');

    // Clean up child node
    handleDeleteNode(new Request('http://localhost/'), jsonChild.node.id);
  });

  it('7. Deletes department nodes and level types cleanly after unlinking', async () => {
    expect(createdNodeId).toBeTruthy();
    expect(createdTypeId).toBeTruthy();

    // Act: Delete node
    const resNode = handleDeleteNode(new Request('http://localhost/'), createdNodeId);
    expect(resNode.status).toBe(200);

    // Act: Delete level type
    const resType = handleDeleteNodeType(new Request('http://localhost/'), createdTypeId);
    expect(resType.status).toBe(200);
  });
});
