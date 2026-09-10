/**
 * SG Forge Unit Test: Lifetime Token Ledger & Headroom Context Compression
 * Enterprise Clean Architecture (2026 LTS)
 *
 * @requirements [LLR-OBS-001] [LLR-SUB-007]
 */
import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
const { readLedger, syncCurrentSession } = await import(join(process.cwd(), 'scripts', 'sync-tokens.ts'));

interface LedgerItem {
  sessionId: string;
  tool?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
}

describe('Lifetime AI Token & Spend Ledger (CodeBurn Engine)', () => {
  const ledgerPath = join(process.cwd(), 'logs', 'token-ledger.jsonl');

  it('verifies that logs/token-ledger.jsonl exists and is not empty', () => {
    expect(existsSync(ledgerPath)).toBe(true);
    const content = readFileSync(ledgerPath, 'utf-8');
    expect(content.trim().length).toBeGreaterThan(0);
  });

  it('parses all lines in token-ledger.jsonl as valid JSON entries', () => {
    const entries: LedgerItem[] = readLedger();
    expect(entries.length).toBeGreaterThan(0);

    for (const entry of entries) {
      expect(entry.sessionId).toBeDefined();
      expect(entry.tool).toBeDefined();
      expect(entry.model).toBeDefined();
      expect(typeof entry.inputTokens).toBe('number');
      expect(typeof entry.outputTokens).toBe('number');
      expect(typeof entry.costUsd).toBe('number');
      expect(entry.inputTokens).toBeGreaterThanOrEqual(0);
      expect(entry.outputTokens).toBeGreaterThanOrEqual(0);
      expect(entry.costUsd).toBeGreaterThanOrEqual(0);
    }
  });

  it('synchronizes a session record without creating duplicate session IDs', () => {
    const testSessionId = 'test-unit-session-id';
    const entry1 = syncCurrentSession(testSessionId, 'antigravity', 'gemini-2.5-pro');
    expect(entry1).not.toBeNull();
    expect(entry1?.sessionId).toBe(testSessionId);

    const initialEntries: LedgerItem[] = readLedger();
    const countBefore = initialEntries.filter((e: LedgerItem) => e.sessionId === testSessionId).length;
    expect(countBefore).toBe(1);

    // Syncing the same session again updates in place
    const entry2 = syncCurrentSession(testSessionId, 'antigravity', 'gemini-2.5-pro');
    expect(entry2?.sessionId).toBe(testSessionId);

    const updatedEntries: LedgerItem[] = readLedger();
    const countAfter = updatedEntries.filter((e: LedgerItem) => e.sessionId === testSessionId).length;
    expect(countAfter).toBe(1);

    // Clean up test entry
    const cleaned = updatedEntries.filter((e: LedgerItem) => e.sessionId !== testSessionId);
    writeFileSync(ledgerPath, cleaned.map((e: LedgerItem) => JSON.stringify(e)).join('\n') + '\n', 'utf-8');
  });
});
