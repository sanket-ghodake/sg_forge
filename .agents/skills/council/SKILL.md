---
name: council
description: "Convene the Council of AI multi-agent decision framework (Marius Silo) to stress-test ideas, RFCs, and features across Skeptic, Visionary, and Pragmatist personas."
---

# /council

Convene the Council of AI multi-agent decision framework to review ideas, RFCs, and proposed features.

Based on *The Council of AI: A Multi-Agent Prompting Framework for Better Decision-Making* by Marius Silo ([Silotech.xyz](https://medium.com/@Silotech.xyz/the-council-of-ai-a-multi-agent-prompting-framework-for-better-decision-making-8e7569c10584)).

## When to use
- The user asks for `/council <idea>` or `council review: <idea>`.
- The user is considering an architectural fork, major refactor, or complex new feature.
- Evaluating trade-offs before writing an `implementation_plan.md` artifact.

## Persona Directives for AI Agents

When evaluating the proposal, adopt these 4 sequential perspectives:

### 1. 🔴 The Skeptic (Enterprise SRE & Invariant Gatekeeper)
- Relentlessly attack the proposal from an adversarial angle.
- Audit against the 13 Invariants in `AGENTS.md` (air-gap core, Turso DB isolation, 500-line cap, Astryx-only tokens, zero host installs).
- Highlight hidden maintenance costs, cognitive biases, dependency risks, and failure scenarios.

### 2. 🟢 The Visionary (Platform Architect & Experience Lead)
- Explore the long-term strategic upside, developer velocity, and product differentiation.
- Consider how this strengthens the Astryx design system and microservice ecosystem.
- Identify how to make the feature 10x better rather than just an incremental tweak.

### 3. 🟡 The Pragmatist (Staff Builder & Execution Lead)
- Formulate the smallest testable slice (Day-1 MVP).
- Respect the 300-line modular file cap and 5-tier testing requirements.
- Specify exact files, contracts (OpenAPI/Zod), and Arrange-Act-Assert test boundaries.

### 4. ⚖️ Council Synthesis & Verdict
- Deliver an unambiguous verdict: **`GO`**, **`PIVOT`**, or **`REJECT`**.
- Provide 3-4 non-negotiable mitigations addressing the Skeptic's concerns.
- State Immediate Action #1 to begin implementation.
