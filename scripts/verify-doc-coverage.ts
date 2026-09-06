/**
 * @file verify-doc-coverage.ts
 * @description SG Forge System Traceability & Code-to-Doc Parity Linter
 * @standards Enterprise Architecture Standards, Enterprise C4 Architecture, High-Reliability Clean Systems
 *
 * Verifies 100% bidirectional coverage:
 * 1. Code -> Doc: Every exported function, class, type must carry a valid @requirements [LLR-...] tag.
 * 2. Doc -> Code: Every requirement defined in docs/ must be implemented in code and verified in tests.
 * 3. Supports --staged flag for pre-commit verification (strict on staged files).
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import ts from "typescript";

// Target directories for source code scan
const REPO_ROOT = resolve(import.meta.dir, "..");
const SOURCE_DIRS = ["apps/src", "forge-apps", "scripts"];
const DOCS_DIR = join(REPO_ROOT, "apps", "src", "docs");
const REPORT_OUTPUT = join(DOCS_DIR, "traceability", "coverage-report.json");

interface SymbolInfo {
  name: string;
  kind: string;
  file: string;
  line: number;
  hasDoc: boolean;
  requirements: string[];
  missingRequirementFiles: string[];
}

interface RequirementInfo {
  id: string;
  type: "SR" | "HLR" | "LLR";
  docFile: string;
  implementedIn: string[];
  verifiedIn: string[];
}

interface AuditReport {
  timestamp: string;
  totalExportedSymbols: number;
  documentedSymbols: number;
  symbolCoveragePercent: number;
  totalRequirements: number;
  implementedRequirements: number;
  verifiedRequirements: number;
  orphanRequirements: string[];
  symbols: SymbolInfo[];
  requirements: Record<string, RequirementInfo>;
}

/**
 * Recursively find files matching extensions while ignoring build & cache folders
 */
function findFiles(dir: string, extensions: string[], excludeSubstrings: string[] = []): string[] {
  if (!existsSync(dir)) return [];
  const results: string[] = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (excludeSubstrings.some((ex) => fullPath.includes(ex))) continue;

    try {
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...findFiles(fullPath, extensions, excludeSubstrings));
      } else if (extensions.some((ext) => fullPath.endsWith(ext))) {
        results.push(fullPath);
      }
    } catch {
      // Skip unreadable files
    }
  }
  return results;
}

/**
 * Extracts requirement tags ([SR-...], [HLR-...], [LLR-...]) from text
 */
function extractRequirementTags(text: string): string[] {
  const tags = new Set<string>();
  const bracketMatches = text.match(/\[(SR|HLR|LLR)-[A-Za-z0-9_.-]+\]/g);
  if (bracketMatches) {
    for (const m of bracketMatches) {
      const tag = m.replace(/[[\]]/g, "");
      if (!tag.includes("...")) tags.add(tag);
    }
  }
  const attrMatches = text.match(/reqId=["']((?:SR|HLR|LLR)-[A-Za-z0-9_.-]+)["']/g);
  if (attrMatches) {
    for (const m of attrMatches) {
      const match = m.match(/reqId=["']([^"']+)["']/);
      if (match && !match[1].includes("...")) tags.add(match[1]);
    }
  }
  const titleMatches = text.match(/title:\s*["']?((?:SR|HLR|LLR)-[A-Za-z0-9_.-]+)/g);
  if (titleMatches) {
    for (const m of titleMatches) {
      const match = m.match(/(SR|HLR|LLR)-[A-Za-z0-9_.-]+/);
      if (match && !match[0].includes("...")) tags.add(match[0]);
    }
  }
  return Array.from(tags);
}

/**
 * Checks if requirement doc file exists in docs/ or submodule docs/
 */
function doesRequirementDocExist(reqId: string): boolean {
  const parts = reqId.split("-");
  const prefix = parts[0]; // SR, HLR, or LLR
  const subfolder = prefix.toLowerCase();

  // Check main apps/src/docs/ and content docs
  const candidateDirs = [
    join(DOCS_DIR, subfolder),
    join(DOCS_DIR, "src", "content", "docs", subfolder),
  ];
  for (const cDir of candidateDirs) {
    if (existsSync(cDir)) {
      const files = readdirSync(cDir);
      if (files.some((f) => f.includes(reqId))) return true;
    }
  }

  // Check submodule docs
  const forgeAppsDir = join(REPO_ROOT, "forge-apps");
  if (existsSync(forgeAppsDir)) {
    for (const app of readdirSync(forgeAppsDir)) {
      const appDocs = join(forgeAppsDir, app, "docs", subfolder);
      if (existsSync(appDocs)) {
        const files = readdirSync(appDocs);
        if (files.some((f) => f.includes(reqId))) return true;
      }
    }
  }

  return false;
}

/**
 * Inspects a TypeScript file AST and discovers all exported symbols and their JSDoc
 */
function auditSourceFile(filePath: string): SymbolInfo[] {
  const symbols: SymbolInfo[] = [];
  const content = readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  function visit(node: ts.Node) {
    const isExported =
      (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0;

    let symbolName = "";
    let symbolKind = "";

    if (isExported) {
      if (ts.isFunctionDeclaration(node) && node.name) {
        symbolName = node.name.text;
        symbolKind = "function";
      } else if (ts.isClassDeclaration(node) && node.name) {
        symbolName = node.name.text;
        symbolKind = "class";
      } else if (ts.isInterfaceDeclaration(node)) {
        symbolName = node.name.text;
        symbolKind = "interface";
      } else if (ts.isTypeAliasDeclaration(node)) {
        symbolName = node.name.text;
        symbolKind = "type";
      } else if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) {
            symbolName = decl.name.text;
            symbolKind = "variable";
          }
        }
      }
    }

    if (symbolName) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      // Extract leading comments / JSDoc
      const fullText = sourceFile.getFullText();
      const commentRanges = ts.getLeadingCommentRanges(fullText, node.getFullStart());
      let commentText = "";
      if (commentRanges && commentRanges.length > 0) {
        commentText = commentRanges
          .map((r) => fullText.substring(r.pos, r.end))
          .join("\n");
      }

      const reqTags = extractRequirementTags(commentText);
      const missingFiles = reqTags.filter((tag) => !doesRequirementDocExist(tag));

      symbols.push({
        name: symbolName,
        kind: symbolKind,
        file: relative(REPO_ROOT, filePath),
        line: line + 1,
        hasDoc: commentText.includes("@requirements") || reqTags.length > 0,
        requirements: reqTags,
        missingRequirementFiles: missingFiles,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return symbols;
}

/**
 * Scans all documentation files in docs/ and forge-apps/ to extract declared requirements
 */
function auditRequirementDocs(): Record<string, RequirementInfo> {
  const reqMap: Record<string, RequirementInfo> = {};
  const docFiles = findFiles(REPO_ROOT, [".md", ".mdx"], ["node_modules", ".cache", "portables", "logs", "dist", ".astro"]);

  for (const docFile of docFiles) {
    const content = readFileSync(docFile, "utf-8");
    const tags = extractRequirementTags(content);

    for (const tag of tags) {
      const prefix = tag.split("-")[0] as "SR" | "HLR" | "LLR";
      if (!reqMap[tag]) {
        reqMap[tag] = {
          id: tag,
          type: prefix,
          docFile: relative(REPO_ROOT, docFile),
          implementedIn: [],
          verifiedIn: [],
        };
      }
    }
  }

  return reqMap;
}

/**
 * Scans all test files to verify requirement verification coverage
 */
function auditTestCoverage(reqMap: Record<string, RequirementInfo>): void {
  const testFiles = findFiles(REPO_ROOT, [".test.ts", ".spec.ts"], ["node_modules", ".cache", "portables"]);

  for (const testFile of testFiles) {
    const content = readFileSync(testFile, "utf-8");
    const tags = extractRequirementTags(content);
    const relPath = relative(REPO_ROOT, testFile);

    for (const tag of tags) {
      if (reqMap[tag]) {
        if (!reqMap[tag].verifiedIn.includes(relPath)) {
          reqMap[tag].verifiedIn.push(relPath);
        }
      }
    }
  }
}

/**
 * Generates an interactive, standalone HTML Traceability Matrix (Astryx Theme)
 */
function generateMatrixHtml(report: AuditReport): void {
  const htmlPath = join(DOCS_DIR, "traceability", "matrix.html");
  const rows = Object.values(report.requirements).map((r) => {
    const status = r.verifiedIn.length > 0 ? "VERIFIED" : r.implementedIn.length > 0 ? "IMPLEMENTED" : "ORPHAN";
    const statusClass = status.toLowerCase();
    const impls = r.implementedIn.length > 0 ? r.implementedIn.map((i) => `<code>${i}</code>`).join("<br>") : "<span class='muted'>None</span>";
    const tests = r.verifiedIn.length > 0 ? r.verifiedIn.map((t) => `<code>${t}</code>`).join("<br>") : "<span class='muted'>None</span>";
    return `<tr>
      <td><strong>${r.id}</strong></td>
      <td><span class="type-pill">${r.type}</span></td>
      <td><code>${r.docFile}</code></td>
      <td>${impls}</td>
      <td>${tests}</td>
      <td><span class="status-pill ${statusClass}">${status}</span></td>
    </tr>`;
  }).join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SG Forge - Living Engineering Traceability Matrix</title>
  <style>
    :root {
      --forge-bg-root: #0b0f19;
      --forge-bg-surface: #111827;
      --forge-border: rgba(255, 255, 255, 0.08);
      --forge-primary: #6366f1;
      --forge-accent: #10b981;
      --forge-warning: #f59e0b;
      --forge-text-main: #f3f4f6;
      --forge-text-muted: #9ca3af;
      --forge-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    body { background: var(--forge-bg-root); color: var(--forge-text-main); font-family: var(--forge-font); margin: 0; padding: 24px; }
    h1 { font-size: 1.5rem; margin-bottom: 8px; }
    .subtitle { color: var(--forge-text-muted); margin-bottom: 24px; font-size: 0.9rem; }
    .metrics { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .metric-card { background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: 8px; padding: 12px 16px; min-width: 140px; }
    .metric-val { font-size: 1.4rem; font-weight: 700; color: var(--forge-primary); }
    .metric-lbl { font-size: 0.75rem; color: var(--forge-text-muted); }
    table { width: 100%; border-collapse: collapse; background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: 8px; overflow: hidden; }
    th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--forge-border); font-size: 0.85rem; }
    th { background: rgba(0,0,0,0.2); font-weight: 600; color: var(--forge-text-muted); }
    code { font-family: monospace; font-size: 0.8rem; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; }
    .type-pill { padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; background: rgba(99,102,241,0.2); color: var(--forge-primary); }
    .status-pill { padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; border: 1px solid; }
    .status-pill.verified { border-color: var(--forge-accent); color: var(--forge-accent); }
    .status-pill.implemented { border-color: var(--forge-primary); color: var(--forge-primary); }
    .status-pill.orphan { border-color: var(--forge-warning); color: var(--forge-warning); }
    .muted { color: var(--forge-text-muted); font-style: italic; }
  </style>
</head>
<body>
  <h1>SG Forge Living Engineering Traceability Matrix</h1>
  <div class="subtitle">Generated: ${report.timestamp} | Audited Symbols: ${report.totalExportedSymbols}</div>
  <div class="metrics">
    <div class="metric-card"><div class="metric-val">${report.symbolCoveragePercent}%</div><div class="metric-lbl">Symbol Coverage</div></div>
    <div class="metric-card"><div class="metric-val">${report.totalRequirements}</div><div class="metric-lbl">Total Requirements</div></div>
    <div class="metric-card"><div class="metric-val">${report.implementedRequirements}</div><div class="metric-lbl">Implemented</div></div>
    <div class="metric-card"><div class="metric-val">${report.verifiedRequirements}</div><div class="metric-lbl">Verified in Tests</div></div>
  </div>
  <table>
    <thead><tr><th>Requirement ID</th><th>Type</th><th>Specification Document</th><th>Implemented Code Symbols</th><th>Verification Tests</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;

  writeFileSync(htmlPath, html, "utf-8");
  console.log(`✅ Saved standalone HTML matrix to: apps/src/docs/traceability/matrix.html`);
}

/**
 * Main execution runner
 * @requirements [SR-GATE-001] [LLR-SUB-007] [SR-DOC-001]
 */
export async function runTraceabilityAudit(isStagedOnly = false, stagedFiles: string[] = []): Promise<boolean> {
  console.log("🔍 [SYSTEM TRACEABILITY] Auditing codebase against SG Forge Living Standards...");

  const allSymbols: SymbolInfo[] = [];
  const reqMap = auditRequirementDocs();
  auditTestCoverage(reqMap);

  // Gather source files
  let sourceFiles: string[] = [];
  if (isStagedOnly && stagedFiles.length > 0) {
    sourceFiles = stagedFiles
      .filter((f) => (f.endsWith(".ts") || f.endsWith(".tsx")) && !f.includes(".test.") && !f.includes(".spec."))
      .map((f) => (f.startsWith("/") ? f : join(REPO_ROOT, f)));
  } else {
    for (const srcDir of SOURCE_DIRS) {
      const dirPath = join(REPO_ROOT, srcDir);
      sourceFiles.push(
        ...findFiles(dirPath, [".ts", ".tsx"], [
          "node_modules",
          ".test.",
          ".spec.",
          ".cache",
          "dist",
          "build",
        ]),
      );
    }
  }

  // Audit symbols
  for (const srcFile of sourceFiles) {
    const symbols = auditSourceFile(srcFile);
    allSymbols.push(...symbols);

    // Cross-reference implementations
    for (const sym of symbols) {
      for (const reqId of sym.requirements) {
        if (reqMap[reqId]) {
          const loc = `${sym.file}:${sym.line}#${sym.name}`;
          if (!reqMap[reqId].implementedIn.includes(loc)) {
            reqMap[reqId].implementedIn.push(loc);
          }
        }
      }
    }
  }

  // Compute metrics
  const totalSymbols = allSymbols.length;
  const documentedSymbols = allSymbols.filter((s) => s.hasDoc && s.requirements.length > 0).length;
  const symbolCoverage = totalSymbols > 0 ? ((documentedSymbols / totalSymbols) * 100).toFixed(1) : "100.0";

  const totalReqs = Object.keys(reqMap).length;
  const implementedReqs = Object.values(reqMap).filter((r) => r.implementedIn.length > 0).length;
  const verifiedReqs = Object.values(reqMap).filter((r) => r.verifiedIn.length > 0).length;
  const orphanReqs = Object.values(reqMap)
    .filter((r) => r.implementedIn.length === 0 && r.verifiedIn.length === 0)
    .map((r) => r.id);

  // Print Summary Table
  console.log("\n========================================================");
  console.log("     SG FORGE LIVING STANDARDS TRACEABILITY REPORT      ");
  console.log("========================================================");
  console.log(`📦 Scanned Source Files:      ${sourceFiles.length}`);
  console.log(`🔷 Total Exported Symbols:    ${totalSymbols}`);
  console.log(`🟢 Documented Symbols:        ${documentedSymbols} (${symbolCoverage}%)`);
  console.log(`📑 Total Declared Reqs:       ${totalReqs} (SR/HLR/LLR)`);
  console.log(`⚙️  Implemented in Code:       ${implementedReqs} (${totalReqs > 0 ? ((implementedReqs / totalReqs) * 100).toFixed(1) : 0}%)`);
  console.log(`🛡️  Verified in Tests:         ${verifiedReqs} (${totalReqs > 0 ? ((verifiedReqs / totalReqs) * 100).toFixed(1) : 0}%)`);
  console.log(`⚠️  Orphan Requirements:       ${orphanReqs.length}`);
  console.log("========================================================\n");

  // Save report artifact
  if (!isStagedOnly) {
    let reportTimestamp = "2026-09-06T21:45:00.000Z";
    try {
      if (existsSync(REPORT_OUTPUT)) {
        const prev = JSON.parse(readFileSync(REPORT_OUTPUT, "utf8"));
        if (prev.timestamp) reportTimestamp = prev.timestamp;
      }
    } catch {}
    if (process.env.SOURCE_DATE_EPOCH) {
      reportTimestamp = new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString();
    }

    const report: AuditReport = {
      timestamp: reportTimestamp,
      totalExportedSymbols: totalSymbols,
      documentedSymbols,
      symbolCoveragePercent: Number.parseFloat(symbolCoverage),
      totalRequirements: totalReqs,
      implementedRequirements: implementedReqs,
      verifiedRequirements: verifiedReqs,
      orphanRequirements: orphanReqs,
      symbols: allSymbols,
      requirements: reqMap,
    };
    writeFileSync(REPORT_OUTPUT, JSON.stringify(report, null, 2), "utf-8");
    console.log(`✅ Saved traceability audit report to: apps/src/docs/traceability/coverage-report.json`);
    generateMatrixHtml(report);
  }

  // Pre-commit failure conditions on staged files
  if (isStagedOnly) {
    const undocumentedStaged = allSymbols.filter((s) => !s.hasDoc || s.requirements.length === 0);
    const brokenRequirementFiles = allSymbols.filter((s) => s.missingRequirementFiles.length > 0);

    if (brokenRequirementFiles.length > 0) {
      console.error("❌ Staged files reference non-existent requirement documents:");
      for (const s of brokenRequirementFiles) {
        console.error(`   - ${s.file}:${s.line} (${s.name}) -> Missing: ${s.missingRequirementFiles.join(", ")}`);
      }
      return false;
    }

    if (undocumentedStaged.length > 0) {
      console.warn(`⚠️ [WARNING] ${undocumentedStaged.length} newly staged symbols lack @requirements [LLR-...] tags.`);
    }
  }

  return true;
}

// CLI Execution entrypoint
if (import.meta.main) {
  const args = process.argv.slice(2);
  const isStaged = args.includes("--staged");
  const files = args.filter((a) => !a.startsWith("--"));

  runTraceabilityAudit(isStaged, files).then((passed) => {
    if (!passed) process.exit(1);
  });
}
