/**
 * @forge/app-template/test/unit - Template Sanity & Database Unit Tests (Tier 1)
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it } from 'bun:test';
import { templateDb } from '../../src/db';

describe('Tier 1 Unit: App Template Database & Invariants', () => {
  it('Arrange, Act, Assert: initializes template_items table and executes CRUD queries', () => {
    // Arrange
    const itemId = `item_${Date.now()}`;
    const itemName = 'Scaffold Test Asset';

    // Act
    templateDb.run('INSERT INTO template_items (id, name, created_at) VALUES (?, ?, ?);', [
      itemId,
      itemName,
      Date.now(),
    ]);

    const item = templateDb
      .query('SELECT * FROM template_items WHERE id = ?;')
      .get(itemId) as { id: string; name: string; created_at: number };

    // Assert
    expect(item).toBeDefined();
    expect(item.id).toBe(itemId);
    expect(item.name).toBe(itemName);

    // Cleanup
    templateDb.run('DELETE FROM template_items WHERE id = ?;', [itemId]);
  });
});
