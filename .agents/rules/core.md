# Core System & Workflows Rules

## 1. Core Invariants & Safe Execution
1. **Code & Doc Preservation**: NEVER remove any code block or documentation without prior thorough analysis and explicit technical justification.
2. **Bash**: Prefix all bash execution with `rtk` (e.g. `rtk git status`, `rtk docker ps`, `rtk bun test`). Chains use `rtk`: `rtk git add . && rtk git commit`.
3. **Zero Host Install Directive & Mandatory Portable FOSS Tooling**: NEVER EVER install anything on developer's host machine (`apt-get`, `npm -g`, `pip install`, `brew`, global OS binaries). ZERO host system modification. Use standalone repo runtimes and portable binaries ONLY: Bun (`bun`, `portables/bun/bin/bun`), Python virtualenv (`./.venv/bin/python3`, `./.venv/bin/mkdocs`), Node 24 LTS (`.node_env/bin/node`), and `portables/bin/*` (`scc`, `lizard`, `tree`, `hyperfine`, `astryx`, `caveman`). If any new open-source CLI, scanner, linter, or runtime is introduced, bundle its binary or portable wrapper strictly inside `portables/bin/` or Docker (`./run.sh docker ...` / `./run.sh toolchain ...`), never install on host. All portable wrappers MUST be self-resolving POSIX shell scripts (no fragile symlinks) to ensure seamless cross-platform execution on Windows, WSL, macOS, and Linux without Git filemode or line-ending drift.
4. **Command Safety**: NEVER run heavy/time-consuming commands (docker builds, full test suites). Provide command to user.
5. **Git Policy**: DO NOT commit automatically (`git commit`). Only stage/commit when explicitly requested.
6. **Work Logs**: Append strictly ONE single line at the very end of `logs/WORKLOGS.md` (tracked in git): `YYYY-MM-DD HH:mm | <brief>` (or via `rtk run "./.agents/hooks/append-log.sh \"<brief>\""`).
7. **Communication**: Caveman ULTRA mode (max token compression, state facts once, no filler).
8. **Root Directory Cleanliness**: Maintain minimal root directory. Store docs in `docs/`, scripts in `scripts/`, agent rules in `.agents/`, and generated outputs in `graphify-out/` or `logs/`. NEVER place new loose files in root.
9. **Open-Source Directive**: All software components, libraries, CLI utilities, security audit tooling, and frameworks used in this workspace MUST be 100% free and open-source (FOSS).
10. **Version Lock & Strict Version Freeze**: NEVER update, upgrade, or downgrade any runtime version, framework version, or package dependency without prior explicit discussion and user approval.
11. **Cross-Agent Instruction Sync Guard**: Whenever modifying or updating ANY agent instruction or rule file (`AGENTS.md`, `.agents/AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.agents/rules/*.md`, `.agents/workforce/*.md`), you MUST run `./.agents/scripts/sync-agent-instructions.sh` to ensure ALL agent instruction files stay 100% synchronized across all IDEs and tools.
12. **Ignore & Attrib Files Uniformity**: Whenever introducing new build artifacts, temporary extensions, sensitive patterns, or database files, you MUST run `rtk bun scripts/sync-ignores.ts` to ensure all 7 root ignore files, `.gitattributes`, and subfolder `logs/.gitignore` files remain 100% synchronized.

---

## 2. Agent Grounding & "No Guessing" Invariant
- **Fact Verification**: When modifying or fixing existing features, agents MUST first inspect existing implementations, callers, schemas, types, and unit tests using Graphify and ripgrep.
- **Explicit Assumptions**: If required behavior cannot be established from repository evidence, the agent MUST explicitly mark and surface the assumption in output rather than silently inventing unverified business logic.

---

## 3. Minimal Change Principle & Diff Budget
- **Scope Discipline**: Make the smallest coherent change that fully satisfies the user's prompt.
- **Zero Opportunistic Refactoring**: Do not rewrite working code, reformat untouched files, or rename unrelated utilities during a scoped task.
- **Diff Budget**: A task targeting a specific bug or feature should only modify closely related files (typically 1–5 files). Unexpected blast radius fails review.

---

## 4. Formal Definition of Done (DoD)
Every completed AI task must conclude with a standardized completion verification:
```markdown
### TASK COMPLETION REPORT
- [x] Requirements Met: <brief explanation>
- [x] Architecture & Layering: PASS (No forbidden imports, 0 circular deps)
- [x] Tests: PASS (Unit / Integration / Contract)
- [x] Security & ASVS 5.0: PASS (Tenant isolation, parameterization verified)
- [x] Diff Scope: <N> files touched (+X / -Y lines, 0 opportunistic refactors)
- [x] Known Limitations / Notes: <none or list>
```

