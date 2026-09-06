/**
 * SG Forge Living Standards Symbol Annotation Engine
 * AST-based progressive annotator injecting @requirements [HLR-...] [LLR-...] tags.
 */

import { readFileSync, writeFileSync } from "fs";
import * as ts from "typescript";

interface AnnotationRule {
  pattern: RegExp;
  reqTag: string;
}

const RULES: AnnotationRule[] = [
  // Auth service
  { pattern: /apps\/src\/auth\/.*crypto/, reqTag: "@requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-006]" },
  { pattern: /apps\/src\/auth\/.*session/, reqTag: "@requirements [HLR-AUTH-101] [LLR-AUTH-001] [LLR-AUTH-002]" },
  { pattern: /apps\/src\/auth\/.*rate-limiter/, reqTag: "@requirements [HLR-AUTH-102] [LLR-AUTH-005]" },
  { pattern: /apps\/src\/auth\/.*totp/, reqTag: "@requirements [HLR-AUTH-101] [LLR-AUTH-001]" },
  { pattern: /apps\/src\/auth\/.*security-headers/, reqTag: "@requirements [HLR-AUTH-102] [LLR-AUTH-007]" },
  { pattern: /apps\/src\/auth\/.*(iam-engine|rbac)/, reqTag: "@requirements [HLR-AUTH-102] [LLR-AUTH-003]" },
  { pattern: /apps\/src\/auth\/.*(hierarchy|org-tree|employee)/, reqTag: "@requirements [HLR-AUTH-102] [LLR-DB-005]" },
  { pattern: /apps\/src\/auth\/.*(audit-logger|telemetry)/, reqTag: "@requirements [HLR-SDK-303] [LLR-SDK-002] [LLR-SDK-003]" },
  { pattern: /apps\/src\/auth\/.*db\//, reqTag: "@requirements [HLR-SDK-302] [LLR-DB-001] [LLR-DB-003]" },
  { pattern: /apps\/src\/auth\/.*frontend\//, reqTag: "@requirements [HLR-UI-401] [LLR-UI-001]" },
  { pattern: /apps\/src\/auth\/.*server/, reqTag: "@requirements [HLR-AUTH-101] [LLR-AUTH-001]" },
  { pattern: /apps\/src\/auth\//, reqTag: "@requirements [HLR-AUTH-101] [LLR-AUTH-003]" },

  // Portal
  { pattern: /apps\/src\/portal\/.*iframe/, reqTag: "@requirements [HLR-PORTAL-202] [LLR-SUB-006]" },
  { pattern: /apps\/src\/portal\/.*inbox/, reqTag: "@requirements [HLR-PORTAL-201] [LLR-UI-003]" },
  { pattern: /apps\/src\/portal\/.*frontend\//, reqTag: "@requirements [HLR-PORTAL-201] [LLR-UI-001]" },
  { pattern: /apps\/src\/portal\//, reqTag: "@requirements [HLR-PORTAL-201] [LLR-SUB-006]" },

  // Dev Dashboard
  { pattern: /apps\/src\/dev-dashboard\/.*(health|probe)/, reqTag: "@requirements [HLR-DEV-501] [LLR-SUB-002]" },
  { pattern: /apps\/src\/dev-dashboard\/.*(db|apps-controller)/, reqTag: "@requirements [HLR-SDK-302] [LLR-DB-001]" },
  { pattern: /apps\/src\/dev-dashboard\/.*log/, reqTag: "@requirements [HLR-SDK-303] [LLR-SUB-004]" },
  { pattern: /apps\/src\/dev-dashboard\/.*frontend\//, reqTag: "@requirements [HLR-UI-401] [LLR-UI-001]" },
  { pattern: /apps\/src\/dev-dashboard\//, reqTag: "@requirements [HLR-DEV-501] [LLR-SUB-002]" },

  // Dev Hub
  { pattern: /apps\/src\/dev-hub\/.*token/, reqTag: "@requirements [HLR-AUTH-101] [LLR-AUTH-001]" },
  { pattern: /apps\/src\/dev-hub\//, reqTag: "@requirements [HLR-HUB-601] [LLR-SUB-005]" },

  // Landing
  { pattern: /apps\/src\/landing.*/, reqTag: "@requirements [HLR-UI-401] [LLR-UI-001]" },

  // Forge Apps Submodules
  { pattern: /forge-apps\/code\//, reqTag: "@requirements [HLR-CODE-701] [LLR-SUB-003]" },
  { pattern: /forge-apps\/telemetry\//, reqTag: "@requirements [HLR-TEL-801] [LLR-SUB-004]" },
  { pattern: /forge-apps\/app-template\//, reqTag: "@requirements [HLR-SDK-301] [LLR-SUB-001]" },

  // Scripts
  { pattern: /scripts\/.*backup/, reqTag: "@requirements [HLR-SDK-302] [LLR-DB-004]" },
  { pattern: /scripts\/.*(proxy|caddy)/, reqTag: "@requirements [HLR-SDK-301] [LLR-SDK-005]" },
  { pattern: /scripts\/.*watchdog/, reqTag: "@requirements [HLR-SDK-301] [LLR-SDK-007]" },
  { pattern: /scripts\/.*(doc-coverage|verify|gate|check)/, reqTag: "@requirements [SR-GATE-001] [LLR-SUB-007]" },
  { pattern: /scripts\//, reqTag: "@requirements [SR-GATE-001] [LLR-SUB-007]" },
];

/**
 * resolveRequirementTag
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function resolveRequirementTag(filePath: string): string {
  for (const rule of RULES) {
    if (rule.pattern.test(filePath)) {
      return rule.reqTag;
    }
  }
  return "@requirements [SR-GATE-001]";
}

/**
 * annotateFile
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function annotateFile(filePath: string): { changed: boolean; count: number } {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  const insertions: { pos: number; comment: string }[] = [];
  const reqTag = resolveRequirementTag(filePath);

  function visit(node: ts.Node) {
    const isExported =
      (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0;

    if (isExported) {
      let isTarget = false;
      let symbolName = "";
      if (
        ts.isFunctionDeclaration(node) ||
        ts.isClassDeclaration(node) ||
        ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isEnumDeclaration(node)
      ) {
        if (node.name) {
          symbolName = node.name.text;
          isTarget = true;
        }
      } else if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) {
            symbolName = decl.name.text;
            isTarget = true;
            break;
          }
        }
      }

      if (isTarget) {
        const commentRanges = ts.getLeadingCommentRanges(content, node.getFullStart()) || [];
        let hasReqTag = false;
        let lastCommentRange: ts.CommentRange | null = null;

        for (const range of commentRanges) {
          const commentText = content.substring(range.pos, range.end);
          if (commentText.includes("@requirements")) {
            hasReqTag = true;
            break;
          }
          lastCommentRange = range;
        }

        if (!hasReqTag) {
          // If there is an existing multi-line JSDoc comment right before node, append @requirements inside it
          if (
            lastCommentRange &&
            content.substring(lastCommentRange.pos, lastCommentRange.pos + 3) === "/**"
          ) {
            // Check if last comment is adjacent to node
            const between = content.substring(lastCommentRange.end, node.getStart());
            if (between.trim() === "") {
              // Insert before closing */
              const closePos = lastCommentRange.end - 2;
              insertions.push({
                pos: closePos,
                comment: ` * ${reqTag}\n `,
              });
              hasReqTag = true;
            }
          }

          if (!hasReqTag) {
            // Prepend new concise JSDoc comment
            insertions.push({
              pos: node.getStart(),
              comment: `/**\n * ${symbolName}\n * ${reqTag}\n */\n`,
            });
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (insertions.length === 0) {
    return { changed: false, count: 0 };
  }

  // Sort insertions backwards by position to apply without shifting indices
  insertions.sort((a, b) => b.pos - a.pos);

  let updated = content;
  for (const ins of insertions) {
    updated = updated.slice(0, ins.pos) + ins.comment + updated.slice(ins.pos);
  }

  // Check 500-line cap
  const updatedLines = updated.split("\n").length;
  if (updatedLines > 500 && lines.length <= 500) {
    // If it breached 500 lines, try ultra-compact 1-line insertions: /** symbolName - reqTag */
    let compact = content;
    const compactInsertions: { pos: number; comment: string }[] = [];

    function visitCompact(node: ts.Node) {
      const isExported =
        (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0;
      if (isExported) {
        let isTarget = false;
        if (
          ts.isFunctionDeclaration(node) ||
          ts.isClassDeclaration(node) ||
          ts.isInterfaceDeclaration(node) ||
          ts.isTypeAliasDeclaration(node) ||
          ts.isEnumDeclaration(node) ||
          ts.isVariableStatement(node)
        ) {
          isTarget = true;
        }
        if (isTarget) {
          const commentRanges = ts.getLeadingCommentRanges(content, node.getFullStart()) || [];
          const hasReqTag = commentRanges.some((r) =>
            content.substring(r.pos, r.end).includes("@requirements")
          );
          if (!hasReqTag) {
            compactInsertions.push({
              pos: node.getStart(),
              comment: `/** ${reqTag} */\n`,
            });
          }
        }
      }
      ts.forEachChild(node, visitCompact);
    }

    visitCompact(sourceFile);
    compactInsertions.sort((a, b) => b.pos - a.pos);

    for (const ins of compactInsertions) {
      compact = compact.slice(0, ins.pos) + ins.comment + compact.slice(ins.pos);
    }

    if (compact.split("\n").length <= 500) {
      writeFileSync(filePath, compact, "utf-8");
      return { changed: true, count: compactInsertions.length };
    } else {
      console.warn(`⚠️ Warning: ${filePath} is ${lines.length} lines, skipping full comment to protect 500-line cap.`);
      return { changed: false, count: 0 };
    }
  }

  writeFileSync(filePath, updated, "utf-8");
  return { changed: true, count: insertions.length };
}

// CLI runner
if (process.argv[1]?.endsWith("annotate-app-symbols.ts")) {
  const targetDir = process.argv[2] || "apps/src/auth";
  const { readdirSync, statSync } = require("fs");
  const { join } = require("path");

  function scan(dir: string): string[] {
    const res: string[] = [];
    for (const f of readdirSync(dir)) {
      if (f === "node_modules" || f === "dist" || f === ".git") continue;
      const full = join(dir, f);
      if (statSync(full).isDirectory()) {
        res.push(...scan(full));
      } else if ((full.endsWith(".ts") || full.endsWith(".tsx")) && !full.endsWith(".test.ts") && !full.endsWith(".spec.ts")) {
        res.push(full);
      }
    }
    return res;
  }

  const files = scan(targetDir);
  let totalAnnotated = 0;
  for (const f of files) {
    const res = annotateFile(f);
    if (res.changed) {
      console.log(`  Annotated ${res.count} symbols in ${f}`);
      totalAnnotated += res.count;
    }
  }
  console.log(`✅ Annotated ${totalAnnotated} symbols in ${targetDir}`);
}
