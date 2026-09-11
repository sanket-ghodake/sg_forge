---
description: Council of AI Multi-Agent Decision & Review Framework (Marius Silo)
---

# Council of AI: Multi-Agent Decision & Review Framework

Use this workflow to stress-test ideas, architectural proposals, RFCs, or new feature requests from multiple diverse perspectives to prevent cognitive biases and premature decisions.

Based on *The Council of AI: A Multi-Agent Prompting Framework for Better Decision-Making* by Marius Silo ([Silotech.xyz](https://medium.com/@Silotech.xyz/the-council-of-ai-a-multi-agent-prompting-framework-for-better-decision-making-8e7569c10584)).

---

## 🎯 When to Convene the Council

Convene the Council when:
- Evaluating a major new feature or architectural refactor.
- Deciding whether to adopt a new technology, pattern, or data store.
- Stress-testing an idea for security, multi-tenant isolation, or invariant violations.
- Resolving trade-offs between long-term ambition and immediate engineering reality.

---

## 🚀 How to Run the Council

### In-Chat Invocation
Simply ask the AI agent in chat:
```text
/council <your idea or proposal>
```
or
```text
council review: <your idea or proposal>
```

### Terminal CLI Invocation
Run directly from your terminal using portable repo binaries:
```bash
# Interactive ANSI review
rtk ./run.sh council "Migrate session auth to passkeys"

# Save evaluation as a Markdown ADR in logs/council/
rtk ./run.sh council "Adopt WebRTC for terminal sharing" --save

# Output raw Markdown or JSON
rtk ./run.sh council "Implement real-time presence" --format md
```

---

## 👥 The 4 Council Rounds

1. **🔴 Round 1: The Skeptic (Enterprise SRE & Security Gatekeeper)**
   - Vibe: Professional pessimist, invariant guardian.
   - Focus: Blast radius, failure modes, Invariant 1-13 breaches, multi-tenant leaks, air-gap egress.
   - Question: *Why will this fail, cost too much to maintain, or violate architecture standards?*

2. **🟢 Round 2: The Visionary (Platform Architect & Experience Lead)**
   - Vibe: Strategic optimist, 10x value multiplier.
   - Focus: UX delight, Astryx design synergy, developer velocity, platform moat.
   - Question: *How does this unlock 10x value and future-proof the platform?*

3. **🟡 Round 3: The Pragmatist (Staff Builder & Execution Lead)**
   - Vibe: Grounded engineer, MVP architect.
   - Focus: Minimal testable slice (Day-1 MVP), 300-line cap, 5-tier test path, zero host changes.
   - Question: *What is the smallest, safest step we can build and test today?*

4. **⚖️ Round 4: Council Synthesis & Verdict**
   - **Verdict**: `GO` (proceed), `PIVOT` (proceed with strict guardrails), or `REJECT` (shelve).
   - **Decision Rationale**: Clear, grounded justification balancing the three perspectives.
   - **Non-Negotiable Mitigations**: Must-have guardrails before any code is committed.
   - **Immediate Action #1**: The concrete Day-1 step to start execution.
