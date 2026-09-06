/**
 * @forge/portal - Tier 1 Unit Tests: Real Org Tree & 5-Level Progressive Resolution (2026 LTS)
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it } from 'bun:test';
import { getOrgTree } from '@forge/auth';

describe('Tier 1 Unit: Real Org Tree & 5-Level Progressive Resolution', () => {
  it('Arrange, Act, Assert: builds organizational tree bounded to maxDepth = 5', () => {
    // Arrange: maxDepth option set to 5
    const maxDepth = 5;

    // Act
    const result = getOrgTree({ maxDepth });

    // Assert
    expect(result).toBeDefined();
    expect(typeof result.organizationName).toBe('string');
    expect(typeof result.totalEmployees).toBe('number');
    expect(result.maxRenderedDepth).toBe(5);

    if (result.root) {
      expect(result.root.level).toBe(1);
      expect(typeof result.root.name).toBe('string');
      expect(typeof result.root.email).toBe('string');
      expect(typeof result.root.directReportCount).toBe('number');
      expect(typeof result.root.totalSubtreeCount).toBe('number');
      expect(Array.isArray(result.root.children)).toBe(true);

      // Verify no node in returned tree exceeds level 5
      function checkDepth(node: typeof result.root) {
        if (!node) return;
        expect(node.level).toBeLessThanOrEqual(5);
        if (node.level === 5 && node.directReportCount > 0) {
          expect(node.hasMoreChildren).toBe(true);
          expect(node.children.length).toBe(0); // Pruned for progressive expansion
        }
        node.children.forEach(checkDepth);
      }
      checkDepth(result.root);
    }
  });

  it('Arrange, Act, Assert: resolves progressive subtree when rootId is specified', () => {
    // Arrange: get primary tree first
    const fullTree = getOrgTree({ maxDepth: 5 });
    if (!fullTree.root || fullTree.root.children.length === 0) return;

    const childId = fullTree.root.children[0].id;

    // Act: fetch subtree rooted at child node
    const subTree = getOrgTree({ maxDepth: 5, rootId: childId });

    // Assert
    expect(subTree.root).toBeDefined();
    expect(subTree.root?.id).toBe(childId);
    expect(subTree.root?.level).toBe(1); // Subtree root is mapped as level 1 of view
  });

  it('Arrange, Act, Assert: respects smaller maxDepth parameter (e.g. 3 levels)', () => {
    // Arrange
    const maxDepth = 3;

    // Act
    const result = getOrgTree({ maxDepth });

    // Assert
    expect(result.maxRenderedDepth).toBe(3);
    if (result.root) {
      function checkDepth3(node: typeof result.root) {
        if (!node) return;
        expect(node.level).toBeLessThanOrEqual(3);
        node.children.forEach(checkDepth3);
      }
      checkDepth3(result.root);
    }
  });
});
