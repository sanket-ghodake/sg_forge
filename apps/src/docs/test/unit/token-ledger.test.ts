/**
 * SG Forge Unit Test: Lifetime Token Ledger & Tokscale Analytics
 * Enterprise Clean Architecture (2026 LTS)
 *
 * @requirements [LLR-OBS-001] [LLR-SUB-007]
 */
import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface TokenLedgerEntry {
  timestamp: string;
  sessionId: string;
  tool: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  costUsd: number;
}

interface TokscaleEntry {
  client: string;
  workspaceKey: string;
  workspaceLabel: string;
  model: string;
  provider: string;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  reasoning: number;
  messageCount: number;
  cost: number;
}

const runner = await import(join(process.cwd(), 'scripts', 'tokscale-runner.ts'));
const readLedger: (path?: string) => TokenLedgerEntry[] = runner.readLedger;
const syncTokensToLedger: (entries: TokscaleEntry[], path?: string) => TokenLedgerEntry[] = runner.syncTokensToLedger;

describe('Lifetime AI Token & Spend Ledger (Tokscale Engine)', () => {
  const ledgerPath = join(process.cwd(), 'logs', 'token-ledger.jsonl');

  it('verifies that logs/token-ledger.jsonl exists and is not empty', () => {
    expect(existsSync(ledgerPath)).toBe(true);
    const content = readFileSync(ledgerPath, 'utf-8');
    expect(content.trim().length).toBeGreaterThan(0);
  });

  it('parses all lines in token-ledger.jsonl as valid JSON entries', () => {
    const entries: TokenLedgerEntry[] = readLedger(ledgerPath);
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

  it('synchronizes genuine Tokscale records monotonically into token-ledger.jsonl', () => {
    const mockEntries: TokscaleEntry[] = [
      {
        client: 'tokscale-test-client',
        workspaceKey: process.cwd(),
        workspaceLabel: 'test-workspace',
        model: 'gemini-3.7-flash',
        provider: 'google',
        input: 15000,
        output: 500,
        cacheRead: 20000,
        cacheWrite: 0,
        reasoning: 100,
        messageCount: 5,
        cost: 0.05,
      },
    ];

    const initialEntries = readLedger(ledgerPath);
    const synced = syncTokensToLedger(mockEntries, ledgerPath);
    expect(synced.length).toBeGreaterThanOrEqual(initialEntries.length);

    const testRecord = synced.find((e: TokenLedgerEntry) => e.tool === 'tokscale-test-client');
    expect(testRecord).toBeDefined();
    expect(testRecord?.inputTokens).toBe(15000);
    expect(testRecord?.cachedTokens).toBe(20000);

    // Restore initial ledger state to prevent test pollution
    writeFileSync(ledgerPath, initialEntries.map((e: TokenLedgerEntry) => JSON.stringify(e)).join('\n') + '\n', 'utf-8');
  });

  it('guarantees monotonic survival across simulated machine migration or cache wipe', () => {
    // Simulate an empty local cache on a new machine
    const emptyLocalEntries: TokscaleEntry[] = [];
    const currentLedger = readLedger(ledgerPath);
    expect(currentLedger.length).toBeGreaterThan(0);

    // Syncing an empty local cache MUST NOT wipe existing Git history
    const synced = syncTokensToLedger(emptyLocalEntries, ledgerPath);
    expect(synced.length).toBe(currentLedger.length);

    // Ensure tokens didn't decrease
    for (const item of synced) {
      const original = currentLedger.find((e: TokenLedgerEntry) => e.tool === item.tool && e.model === item.model);
      expect(original).toBeDefined();
      expect(item.inputTokens).toBeGreaterThanOrEqual(original!.inputTokens);
      expect(item.outputTokens).toBeGreaterThanOrEqual(original!.outputTokens);
      expect(item.costUsd).toBeGreaterThanOrEqual(original!.costUsd);
    }
  });
});
