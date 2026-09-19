/**
 * SG Forge Unit Test: Standalone Tokscale Engine & Workspace Isolation
 * Enterprise Clean Architecture (2026 LTS)
 *
 * @requirements [LLR-OBS-001] [LLR-SUB-007]
 */
import { describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const runner = await import(join(process.cwd(), 'scripts', 'tokscale-runner.ts'));
const getRepoWorkspaces: (dir?: string) => { paths: string[]; labels: string[] } = runner.getRepoWorkspaces;
const filterEntriesByWorkspace: (entries: TokscaleEntry[], ws?: { paths: string[]; labels: string[] }) => TokscaleEntry[] = runner.filterEntriesByWorkspace;
const formatNumber: (n: number) => string = runner.formatNumber;

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

describe('Tokscale Standalone Engine & Repository Isolation', () => {
  const rootDir = process.cwd();
  const wrapperPath = join(rootDir, 'portables', 'bin', 'tokscale');

  it('verifies that portables/bin/tokscale exists and is executable', () => {
    expect(existsSync(wrapperPath)).toBe(true);
  });

  it('verifies that portables/bin/tokscale --version executes successfully', () => {
    const res = spawnSync(wrapperPath, ['--version'], { encoding: 'utf-8' });
    expect(res.status).toBe(0);
    expect(res.stdout || res.stderr).toContain('tokscale');
  });

  it('resolves repo workspaces including root folder and worktree variants', () => {
    const workspaces = getRepoWorkspaces(rootDir);
    expect(workspaces.paths.length).toBeGreaterThan(0);
    expect(workspaces.labels.length).toBeGreaterThan(0);
    expect(workspaces.labels.some((l: string) => l.includes('org_website'))).toBe(true);
  });

  it('strictly filters out foreign workspaces and preserves repository entries', () => {
    const mockEntries: TokscaleEntry[] = [
      {
        client: 'codex',
        workspaceKey: '/home/sanket/Desktop/Sanket/Sentinel',
        workspaceLabel: 'Sentinel',
        model: 'gpt-5.5',
        provider: 'openai',
        input: 90000,
        output: 20000,
        cacheRead: 600000,
        cacheWrite: 0,
        reasoning: 800,
        messageCount: 20,
        cost: 1.47,
      },
      {
        client: 'antigravity-cli',
        workspaceKey: join(rootDir, 'apps/src/docs'),
        workspaceLabel: 'org_website_clone',
        model: 'gemini-3.7-flash',
        provider: 'google',
        input: 50000,
        output: 1000,
        cacheRead: 500000,
        cacheWrite: 0,
        reasoning: 500,
        messageCount: 10,
        cost: 0.10,
      },
    ];

    const workspaces = getRepoWorkspaces(rootDir);
    const filtered = filterEntriesByWorkspace(mockEntries, workspaces);

    // Sentinel must be excluded
    expect(filtered.some((e: TokscaleEntry) => e.workspaceLabel === 'Sentinel')).toBe(false);
    // Repository entry must be included
    expect(filtered.some((e: TokscaleEntry) => e.workspaceLabel === 'org_website_clone')).toBe(true);
    expect(filtered.length).toBe(1);
  });

  it('formats large token quantities into clean metric strings', () => {
    expect(formatNumber(500)).toBe('500');
    expect(formatNumber(1500)).toBe('1.5k');
    expect(formatNumber(1500000)).toBe('1.50M');
    expect(formatNumber(2000000000)).toBe('2.00B');
  });
});
