/**
 * @forge/docs - Tier 1 Unit Test: Modern Docs Landing Page & Tooling Provenance
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 * @requirements [SR-DOC-001] [HLR-UI-401] [LLR-SDK-005]
 */

import { describe, expect, it } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DOCS_SRC = join(import.meta.dir, '../../src');

describe('Tier 1 Unit: Modern Docs Landing & Tooling Attribution', () => {
  it('Arrange, Act, Assert: verifies ToolingProvenance.astro explicitly mentions documentation & diagram tools', () => {
    // Arrange
    const componentPath = join(DOCS_SRC, 'components/ToolingProvenance.astro');
    expect(existsSync(componentPath)).toBe(true);

    // Act
    const content = readFileSync(componentPath, 'utf-8');

    // Assert: Documentation tools
    expect(content).toContain('Astro Starlight');
    expect(content).toContain('Pagefind WebAssembly (WASM)');
    expect(content).toContain('Astryx Design System');
    expect(content).toContain('Graphify Knowledge Graph');

    // Assert: Diagramming tools
    expect(content).toContain('Editorial Python Vector Pipeline');
    expect(content).toContain('draw.io &amp; Mermaid AST Extractors');
    expect(content).toContain('Astryx Dual-Lens Viewer');
    expect(content).toContain('diagram-design Skill Standards');
  });

  it('Arrange, Act, Assert: verifies DocsHero.astro renders hero headline, search prompt, and metrics', () => {
    // Arrange
    const componentPath = join(DOCS_SRC, 'components/DocsHero.astro');
    expect(existsSync(componentPath)).toBe(true);

    // Act
    const content = readFileSync(componentPath, 'utf-8');

    // Assert
    expect(content).toContain('SG Forge Living Documentation');
    expect(content).toContain('Mission-Critical Architecture');
    expect(content).toContain('100% Air-Gapped');
    expect(content).toContain('Dedicated Instance / App');
    expect(content).toContain('Pagefind WASM');
    expect(content).toContain('data-astryx-tooltip');
  });

  it('Arrange, Act, Assert: verifies AudienceGuide.astro covers both Developer and Non-Technical paths', () => {
    // Arrange
    const componentPath = join(DOCS_SRC, 'components/AudienceGuide.astro');
    expect(existsSync(componentPath)).toBe(true);

    // Act
    const content = readFileSync(componentPath, 'utf-8');

    // Assert: Developer path
    expect(content).toContain('For Developers &amp; Engineers');
    expect(content).toContain('Foundation SDK (@forge/sdk)');
    expect(content).toContain('Developer CLI &amp; RTK');

    // Assert: Non-Technical & Stakeholder path
    expect(content).toContain('For Leaders &amp; Stakeholders');
    expect(content).toContain('100% Air-Gapped Network');
    expect(content).toContain('Multi-Tenant Database Isolation');
  });

  it('Arrange, Act, Assert: verifies PlatformBentoGrid.astro renders all 6 core pillars', () => {
    // Arrange
    const componentPath = join(DOCS_SRC, 'components/PlatformBentoGrid.astro');
    expect(existsSync(componentPath)).toBe(true);

    // Act
    const content = readFileSync(componentPath, 'utf-8');

    // Assert
    expect(content).toContain('Zero-Egress Air-Gapped Network');
    expect(content).toContain('Multi-Tenant Dedicated Turso DB');
    expect(content).toContain('Zero-Trust Identity & RBAC');
    expect(content).toContain('Astryx Universal UI System');
    expect(content).toContain('Autonomous Forge Submodules');
    expect(content).toContain('100% Systems Traceability Engine');
  });

  it('Arrange, Act, Assert: verifies index.mdx integrates all modular landing sections', () => {
    // Arrange
    const indexPath = join(DOCS_SRC, 'content/docs/index.mdx');
    expect(existsSync(indexPath)).toBe(true);

    // Act
    const content = readFileSync(indexPath, 'utf-8');

    // Assert
    expect(content).toContain('DocsHero');
    expect(content).toContain('AudienceGuide');
    expect(content).toContain('PlatformBentoGrid');
    expect(content).toContain('TopologyShowcase');
    expect(content).toContain('ToolingProvenance');
    expect(content).toContain('CoverageMatrix');
  });

  it('Arrange, Act, Assert: verifies CoverageMatrix.astro resolves live coverage report paths', () => {
    // Arrange
    const componentPath = join(DOCS_SRC, 'components/CoverageMatrix.astro');
    expect(existsSync(componentPath)).toBe(true);

    // Act
    const content = readFileSync(componentPath, 'utf-8');

    // Assert: Check candidate paths include local and repo-root paths
    expect(content).toContain('traceability/coverage-report.json');
    expect(content).toContain('apps/src/docs/traceability/coverage-report.json');
  });

  it('Arrange, Act, Assert: verifies Visual Architecture Atlas is published and accessible', () => {
    // Arrange
    const atlasPath = join(DOCS_SRC, 'content/docs/executive/visual-atlas.mdx');
    expect(existsSync(atlasPath)).toBe(true);

    // Act
    const content = readFileSync(atlasPath, 'utf-8');

    // Assert: Essential visual atlas sections
    expect(content).toContain('Visual Architecture Atlas & Executive Tour');
    expect(content).toContain('DiagramEmbed');
    expect(content).toContain('Plain-English Architecture Glossary');
  });
});
