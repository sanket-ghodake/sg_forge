/**
 * @file council-runner.ts
 * @description Standalone CLI Runner for The Council of AI Multi-Agent Decision Framework
 * @attribution Based on "The Council of AI: A Multi-Agent Prompting Framework for Better Decision-Making"
 *              by Marius Silo (Silotech.xyz) - https://medium.com/@Silotech.xyz/the-council-of-ai-a-multi-agent-prompting-framework-for-better-decision-making-8e7569c10584
 * @standards Enterprise Clean Architecture, 13 Invariants (2026 LTS)
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const VERSION = '1.0.0';

// ANSI Color Tokens (Astryx-aligned palette)
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[38;2;248;113;113m',
  green: '\x1b[38;2;74;222;128m',
  amber: '\x1b[38;2;251;191;36m',
  cyan: '\x1b[38;2;56;189;248m',
  purple: '\x1b[38;2;192;132;252m',
  border: '\x1b[38;2;71;85;105m',
};

interface CouncilAssessment {
  topic: string;
  timestamp: string;
  skeptic: {
    title: string;
    vibe: string;
    focus: string[];
    analysis: string[];
    fatalFlawRisk: string;
  };
  visionary: {
    title: string;
    vibe: string;
    focus: string[];
    analysis: string[];
    multiplierUpside: string;
  };
  pragmatist: {
    title: string;
    vibe: string;
    focus: string[];
    analysis: string[];
    dayOneSlice: string;
  };
  synthesis: {
    verdict: 'GO' | 'PIVOT' | 'REJECT';
    justification: string;
    nonNegotiableMitigations: string[];
    immediateAction: string;
  };
}

function evaluateTopic(topic: string): CouncilAssessment {
  const ts = new Date().toISOString();
  const lower = topic.toLowerCase();

  // Contextual heuristic analysis matching SG Forge domain invariants
  const touchesDb = lower.includes('db') || lower.includes('database') || lower.includes('turso') || lower.includes('data');
  const touchesAuth = lower.includes('auth') || lower.includes('token') || lower.includes('session') || lower.includes('login');
  const touchesUi = lower.includes('ui') || lower.includes('css') || lower.includes('theme') || lower.includes('component') || lower.includes('modal');
  const touchesNet = lower.includes('api') || lower.includes('network') || lower.includes('proxy') || lower.includes('egress') || lower.includes('stream');

  return {
    topic,
    timestamp: ts,
    skeptic: {
      title: 'The Skeptic (Enterprise SRE & Security Gatekeeper)',
      vibe: 'Professional pessimist, adversarial auditor, invariant guardian.',
      focus: [
        'Blast radius across monorepo and microservices',
        'Invariant compliance (Air-gap core, Turso DB isolation, 500-line cap)',
        'Cognitive bias, maintenance debt, and failure modes',
      ],
      analysis: [
        touchesDb
          ? 'CRITICAL INVARIANT 5: Verify strict tenant isolation (org_id / user_id scoping). Dedicated Turso instances per app must never cross-query.'
          : 'Scope creep check: Ensure this does not expand monorepo boundary or breach module encapsulation.',
        touchesAuth
          ? 'CRITICAL INVARIANT 13: 100% branch test coverage required on Auth/RBAC. Zero credentials in browser localStorage; HttpOnly/Secure cookies only.'
          : 'Examine cognitive bias: Are we building this because it is trendy, or does empirical data demand it?',
        touchesUi
          ? 'CRITICAL INVARIANT 3: Zero unapproved CSS or browser defaults. Strict Astryx tokens (--forge-*) with 100% dark/light theme parity.'
          : 'Maintainability audit: Assess token bloat, runtime latency, and AST cyclomatic complexity (CCN <= 10).',
        touchesNet
          ? 'CRITICAL INVARIANT 6: Air-gapped core containers have ZERO outbound egress. Reverse proxy must manage dynamic ingress.'
          : 'Failure scenario: What happens when dependencies fail, timeouts trigger, or the process crashes during execution?',
      ],
      fatalFlawRisk: 'High maintenance overhead and invariant violation if implemented without strict boundary encapsulation.',
    },
    visionary: {
      title: 'The Visionary (Platform Architect & Experience Lead)',
      vibe: 'Strategic optimist, 10x multiplier thinker, ecosystem strategist.',
      focus: [
        'Developer ergonomics and velocity amplification',
        'Astryx component synergy and delightful UX',
        'Competitive moat, future-proofing, and platform leverage',
      ],
      analysis: [
        'Unlocks substantial developer efficiency and clean separation of concerns.',
        'Positions SG Forge as a state-of-the-art enterprise architecture with first-class primitives.',
        'Creates reusable building blocks that autonomous Forge App submodules can adopt out-of-the-box.',
        'Transforms an ad-hoc problem into a standardized, repeatable platform superpower.',
      ],
      multiplierUpside: 'Compounding developer productivity and seamless multi-tenant platform extensibility.',
    },
    pragmatist: {
      title: 'The Pragmatist (Staff Builder & Execution Lead)',
      vibe: 'Grounded engineer, MVP architect, relentless simplifier.',
      focus: [
        'Smallest testable slice (Day-1 MVP)',
        'Adherence to 300-line file cap and zero host modifications',
        '5-Tier test strategy (Unit, Integration, Security, Contracts, E2E)',
      ],
      analysis: [
        'Strip the proposal down to its bare-metal core: avoid premature generalization or gold-plating.',
        'Implement strictly via portable binaries and Bun runtime (zero host npm/pip footprint).',
        'Enforce modular decomposition (keep conductors <= 300 lines, total file <= 500 lines).',
        'Wire Arrange-Act-Assert (3A) tests verifying both positive and negative error paths.',
      ],
      dayOneSlice: 'Deliver an isolated, single-responsibility proof of concept with Tier 1 and Tier 2 test verification.',
    },
    synthesis: {
      verdict: touchesAuth || touchesDb ? 'PIVOT' : 'GO',
      justification:
        touchesAuth || touchesDb
          ? 'Proceed ONLY with strict invariant guardrails: formal Zod/OpenAPI contract, dedicated DB isolation, and negative security tests.'
          : 'Approved for implementation following the minimal testable slice and 5-tier test governance.',
      nonNegotiableMitigations: [
        '1. Zero host alterations: strictly use portables/ or portable Bun runtime.',
        '2. Zero browser/OS defaults: Astryx tokens and slim scrollbars mandatory.',
        '3. 100% Branch Coverage on Auth/RBAC, >=90% on core business logic.',
        '4. Cyclomatic Complexity CCN <= 10 and modular files <= 300 lines.',
      ],
      immediateAction: 'Draft an isolated LLR specification in docs/llr/ and scaffold the minimal Day-1 test suite.',
    },
  };
}

function renderAnsi(assessment: CouncilAssessment): void {
  const line = `${c.border}${'─'.repeat(74)}${c.reset}`;
  console.log(`\n${line}`);
  console.log(`${c.bold}${c.purple}🏛️  THE COUNCIL OF AI — MULTI-AGENT DECISION FRAMEWORK${c.reset} ${c.dim}(v${VERSION})${c.reset}`);
  console.log(`${c.dim}Attribution: Marius Silo (Silotech.xyz) | Tailored for SG Forge (2026 LTS)${c.reset}`);
  console.log(`${line}`);
  console.log(`${c.bold}Topic:${c.reset} ${c.cyan}${assessment.topic}${c.reset}`);
  console.log(`${c.dim}Timestamp: ${assessment.timestamp}${c.reset}\n`);

  // Persona 1: Skeptic
  console.log(`${c.bold}${c.red}🔴 [ROUND 1] ${assessment.skeptic.title}${c.reset}`);
  console.log(`${c.dim}Vibe: ${assessment.skeptic.vibe}${c.reset}`);
  for (const item of assessment.skeptic.analysis) {
    console.log(`   ${c.red}•${c.reset} ${item}`);
  }
  console.log(`   ${c.bold}Warning:${c.reset} ${c.dim}${assessment.skeptic.fatalFlawRisk}${c.reset}\n`);

  // Persona 2: Visionary
  console.log(`${c.bold}${c.green}🟢 [ROUND 2] ${assessment.visionary.title}${c.reset}`);
  console.log(`${c.dim}Vibe: ${assessment.visionary.vibe}${c.reset}`);
  for (const item of assessment.visionary.analysis) {
    console.log(`   ${c.green}•${c.reset} ${item}`);
  }
  console.log(`   ${c.bold}Upside:${c.reset} ${c.dim}${assessment.visionary.multiplierUpside}${c.reset}\n`);

  // Persona 3: Pragmatist
  console.log(`${c.bold}${c.amber}🟡 [ROUND 3] ${assessment.pragmatist.title}${c.reset}`);
  console.log(`${c.dim}Vibe: ${assessment.pragmatist.vibe}${c.reset}`);
  for (const item of assessment.pragmatist.analysis) {
    console.log(`   ${c.amber}•${c.reset} ${item}`);
  }
  console.log(`   ${c.bold}Day-1 Slice:${c.reset} ${c.cyan}${assessment.pragmatist.dayOneSlice}${c.reset}\n`);

  // Stage 4: Synthesis
  const verdictColor =
    assessment.synthesis.verdict === 'GO' ? c.green : assessment.synthesis.verdict === 'PIVOT' ? c.amber : c.red;
  console.log(`${line}`);
  console.log(`${c.bold}⚖️  [ROUND 4] COUNCIL SYNTHESIS & FINAL VERDICT: ${verdictColor}${c.bold}${assessment.synthesis.verdict}${c.reset}`);
  console.log(`${line}`);
  console.log(`${c.bold}Justification:${c.reset} ${assessment.synthesis.justification}`);
  console.log(`\n${c.bold}Non-Negotiable Mitigations:${c.reset}`);
  for (const m of assessment.synthesis.nonNegotiableMitigations) {
    console.log(`   ${m}`);
  }
  console.log(`\n${c.bold}Immediate Action #1:${c.reset} ${c.cyan}${assessment.synthesis.immediateAction}${c.reset}\n`);
}

function renderMarkdown(assessment: CouncilAssessment): string {
  return `# Council of AI Decision Record: ${assessment.topic}

> **Framework Attribution**: Marius Silo ([Silotech.xyz](https://medium.com/@Silotech.xyz/the-council-of-ai-a-multi-agent-prompting-framework-for-better-decision-making-8e7569c10584))  
> **Conducted On**: ${assessment.timestamp}  
> **Engine**: SG Forge Council of AI Toolchain (v${VERSION})

---

## 🔴 Round 1: ${assessment.skeptic.title}
*Vibe*: ${assessment.skeptic.vibe}

${assessment.skeptic.analysis.map((a) => `- ${a}`).join('\n')}

**Key Vulnerability**: ${assessment.skeptic.fatalFlawRisk}

---

## 🟢 Round 2: ${assessment.visionary.title}
*Vibe*: ${assessment.visionary.vibe}

${assessment.visionary.analysis.map((a) => `- ${a}`).join('\n')}

**10x Value Multiplier**: ${assessment.visionary.multiplierUpside}

---

## 🟡 Round 3: ${assessment.pragmatist.title}
*Vibe*: ${assessment.pragmatist.vibe}

${assessment.pragmatist.analysis.map((a) => `- ${a}`).join('\n')}

**Minimal Testable Slice (Day 1)**: ${assessment.pragmatist.dayOneSlice}

---

## ⚖️ Round 4: Council Synthesis & Verdict

### Final Verdict: **${assessment.synthesis.verdict}**

**Decision Rationale**:
${assessment.synthesis.justification}

### Non-Negotiable Mitigations:
${assessment.synthesis.nonNegotiableMitigations.join('\n')}

### Immediate Action #1:
${assessment.synthesis.immediateAction}
`;
}

function showHelp(): void {
  console.log(`
🏛️  Council of AI CLI (SG Forge Toolchain)

Usage:
  rtk ./run.sh council "<topic or idea>" [options]
  rtk portables/bin/council "<topic or idea>" [options]

Options:
  --save, -s            Save evaluation report to logs/council/YYYY-MM-DD-<slug>.md
  --format <md|json>    Output raw Markdown or JSON instead of terminal ANSI
  --help, -h            Show this help dialog

Attribution:
  Based on "The Council of AI: A Multi-Agent Prompting Framework for Better Decision-Making"
  by Marius Silo (Silotech.xyz).
`);
}

// Main CLI Entrypoint
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

const shouldSave = args.includes('--save') || args.includes('-s');
const formatIdx = args.indexOf('--format');
const format = formatIdx !== -1 ? args[formatIdx + 1] : 'ansi';

const topicArgs = args.filter((a) => !a.startsWith('-') && a !== format);
const topic = topicArgs.join(' ').trim();

if (!topic) {
  console.error('❌ Please provide a topic or idea for the Council to review.');
  process.exit(1);
}

const assessment = evaluateTopic(topic);

if (format === 'json') {
  console.log(JSON.stringify(assessment, null, 2));
} else if (format === 'md') {
  console.log(renderMarkdown(assessment));
} else {
  renderAnsi(assessment);
}

if (shouldSave) {
  const repoRoot = resolve(import.meta.dir, '..');
  const councilDir = resolve(repoRoot, 'logs', 'council');
  if (!existsSync(councilDir)) {
    mkdirSync(councilDir, { recursive: true });
  }

  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50);
  const dateStr = new Date().toISOString().slice(0, 10);
  const targetFile = resolve(councilDir, `${dateStr}-${slug}.md`);

  writeFileSync(targetFile, renderMarkdown(assessment), 'utf-8');
  console.log(`📝 ${c.green}Council decision record saved to:${c.reset} ${targetFile}\n`);
}
