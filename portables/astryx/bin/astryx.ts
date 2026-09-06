#!/usr/bin/env bun
/**
 * Astryx Standalone Portable CLI - v2.0.0 (2026 LTS)
 * AI-Ready Design System Tooling, Token Validator & Component Generator
 * Enterprise Clean Architecture Standards
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ARGS = process.argv.slice(2);
const COMMAND = ARGS[0] || "help";
const CWD = process.cwd();

const ASTRYX_CONFIG_PATH = join(CWD, "apps", "src", "ui", "astryx.config.json");

function showHelp() {
  console.log(`
Astryx CLI v2.0.0 (Standalone Portable)
Enterprise Design System Tooling for Next.js 16, React 19 & TypeScript 5

Usage:
  astryx init             Initialize Astryx design system tokens
  astryx status           Show Astryx integration and token status
  astryx validate         Validate codebase for Astryx token compliance & zero rogue CSS
  astryx help             Display this help message
`);
}

function initAstryx() {
  console.log("=== Initiating Astryx Design System v2.0.0 ===");
  const targetDir = join(CWD, "apps", "src", "ui");
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  const config = {
    version: "2.0.0",
    framework: "next16-react19",
    styling: "astryx-tokens-vanilla-css",
    aiEnabled: true,
    tokensDir: "apps/src/ui",
    theme: {
      default: "midnight-dark",
      supported: ["midnight-dark", "deep-slate", "light"],
    },
    updatedAt: new Date().toISOString(),
  };

  writeFileSync(ASTRYX_CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
  console.log(`✅ Config created: ${ASTRYX_CONFIG_PATH}`);
  console.log("🚀 Astryx v2.0.0 initialized successfully.");
}

function statusAstryx() {
  if (!existsSync(ASTRYX_CONFIG_PATH)) {
    console.log("⚠️ Astryx not initialized in this workspace. Run 'astryx init' first.");
    return;
  }
  const config = JSON.parse(readFileSync(ASTRYX_CONFIG_PATH, "utf8"));
  console.log("Astryx Status:");
  console.log(`- Version: ${config.version}`);
  console.log(`- Framework: ${config.framework}`);
  console.log(`- AI Enabled: ${config.aiEnabled}`);
  console.log(`- Default Theme: ${config.theme.default}`);
  console.log(`- Config Path: ${ASTRYX_CONFIG_PATH}`);
}

function getScanFiles(dir: string): string[] {
  let files: string[] = [];
  if (!existsSync(dir)) return files;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', '.next', '.astro', 'dist', 'graphify-out', 'portables', 'test', 'diagrams', 'traceability'].includes(entry.name)) {
        files = files.concat(getScanFiles(fullPath));
      }
    } else if (['.ts', '.tsx', '.js', '.jsx', '.html', '.css'].some((ext) => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

export function validateAstryx(): { valid: boolean; violations: string[]; fileCount: number } {
  const scanDirs = [join(CWD, "apps", "src"), join(CWD, "forge-apps")];
  let files: string[] = [];
  for (const d of scanDirs) {
    files = files.concat(getScanFiles(d));
  }

  const violations: string[] = [];

  // Regex patterns
  const rawHexPattern = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
  const unapprovedUtilityPattern = /\b(bg-(red|blue|green|gray|slate|zinc|emerald|indigo|purple|pink|yellow)-\d{2,3}|text-(red|blue|green|gray|slate|zinc|emerald|indigo|purple|pink|yellow)-\d{2,3})\b/g;

  for (const file of files) {
    const rel = relative(CWD, file);

    // Skip the canonical token and stylesheet definition modules
    if (rel.startsWith('apps/src/ui/src/') || rel.endsWith('/lib/ui.ts') || rel.includes('custom.css')) continue;

    const content = readFileSync(file, "utf8");
    const lines = content.split("\n");

    // 1. HTML Entrypoints Must Include Astryx Stylesheet or Tokens
    if (content.includes("<!DOCTYPE html>")) {
      if (!content.includes("getAstryxStyles") && !content.includes("getDashboardStyles") && !content.includes("--forge-")) {
        violations.push(`${rel}: HTML document does not include Astryx design tokens (missing 'getAstryxStyles()')`);
      }
    }

    // 2. Scan Lines for Unapproved Raw Colors, CSS Framework Drifts, and Forbidden Browser Popups
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip comment lines
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) continue;

      // Check for forbidden native alert(), confirm(), prompt() in frontend code (excluding tests)
      if (!file.includes('/test/') && !file.includes('.test.')) {
        if (/\b(alert|confirm|prompt)\s*\(/i.test(line) && !line.includes('window.astryxToast') && !line.includes('auth-alert')) {
          violations.push(
            `${rel}:${i + 1}: Forbidden native browser dialog '${line.trim()}' found. Use Astryx Toasts ('window.astryxToast') or Astryx Modals.`
          );
        }
      }

      // Check for raw unapproved hex colors in CSS/styling strings (ignoring SVG icon color fallbacks if explicitly styled)
      const matches = line.match(rawHexPattern);
      if (matches) {
        // Exclude allowed SVG icon fallbacks or harmless non-CSS IDs if needed
        const nonCssHex = matches.filter((m) => {
          // Flag if used in color, background, border, fill, style string
          return /(:|\bstyle\b|\bcolor\b|\bbackground\b|\bborder\b|\bshadow\b)/i.test(line);
        });

        if (nonCssHex.length > 0) {
          violations.push(
            `${rel}:${i + 1}: Raw hardcoded color '${nonCssHex.join(", ")}' found. Use Astryx CSS variable (e.g. 'var(--forge-primary)', 'var(--forge-bg-card)').`
          );
        }
      }

      // Check for unapproved rogue CSS framework utilities
      const utilMatches = line.match(unapprovedUtilityPattern);
      if (utilMatches) {
        violations.push(
          `${rel}:${i + 1}: Unapproved utility classes '${utilMatches.join(", ")}' detected. Use Astryx CSS components (@forge/ui).`
        );
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
    fileCount: files.length,
  };
}

function runCliValidation() {
  console.log("🎨 [Astryx Portable] Auditing UI components and token compliance across workspaces...");
  const result = validateAstryx();

  if (!result.valid) {
    console.error(`\n❌ [Astryx Error] Found ${result.violations.length} UI token compliance violation(s):`);
    for (const v of result.violations) {
      console.error(`   └─ ${v}`);
    }
    console.error("\n💡 Solution: Replace ad-hoc styling with canonical '--forge-*' CSS tokens or '@forge/ui' components.\n");
    process.exit(1);
  } else {
    console.log(`✅ [Astryx Passed] Checked ${result.fileCount} source files. 100% Astryx token compliance.`);
    process.exit(0);
  }
}

function main() {
  switch (COMMAND) {
    case "init":
      initAstryx();
      break;
    case "status":
      statusAstryx();
      break;
    case "validate":
      runCliValidation();
      break;
    default:
      showHelp();
      break;
  }
}

if (import.meta.main) {
  main();
}
