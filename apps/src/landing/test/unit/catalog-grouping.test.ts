/**
 * @forge/landing - Tier 1 Unit: Dynamic Service Catalog Grouping
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { loadServiceRegistry } from '@forge/sdk';

describe('Tier 1 Unit: Landing Catalog Grouping & Registry Invariants', () => {
  it('Arrange, Act, Assert: categorizes discovered micro-apps without orphan items', () => {
    // Arrange: Load active registry
    const services = loadServiceRegistry({ includeDisabled: false });

    // Act: Group by category
    const categories: Record<string, typeof services> = {};
    for (const s of services) {
      if (!categories[s.category]) {
        categories[s.category] = [];
      }
      categories[s.category].push(s);
    }

    // Assert
    expect(services.length).toBeGreaterThan(0);
    const categoryKeys = Object.keys(categories);
    expect(categoryKeys.length).toBeGreaterThan(0);

    for (const [catName, items] of Object.entries(categories)) {
      expect(typeof catName).toBe('string');
      expect(items.length).toBeGreaterThan(0);
      for (const item of items) {
        expect(item.id).toBeDefined();
        expect(item.name).toBeDefined();
        expect(item.path).toBeDefined();
      }
    }
  });
});
