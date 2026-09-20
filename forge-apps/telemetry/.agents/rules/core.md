# Submodule Core Rules

- **Execution**: Run commands using `./run.sh` or local portable binaries.
- **Paths**: Never reference `../../apps/src/*` or parent monorepo folders.
- **Formatting**: Keep source files $\le 300$ lines.
- **Mandatory Code-Doc-Impact Synchronization**: Whenever code changes occur in this microservice, the agent MUST immediately inspect and update affected living documentation (LLRs in `docs/llr/`, module/service `README.md` files, API specs in `docs/api/`) and any dependent or impacted files (schemas in `src/db/`, configs in `.env.example`, test fixtures in `test/`) in the SAME session. Code, documentation, and impacted files must NEVER drift out of sync.

---

## Formal Definition of Done (DoD)
Every completed AI task must conclude with a standardized completion verification:
```markdown
### TASK COMPLETION REPORT
- [x] Requirements Met: <brief explanation>
- [x] Autonomous Isolation: PASS (No parent monorepo imports, self-contained)
- [x] Documentation & Living Specs: PASS (LLRs, service READMEs, API docs synchronized)
- [x] Impacted Files Synchronized: PASS (Configs, database schemas, test suites updated)
- [x] Tests: PASS (Unit / Integration / Contract / Security)
- [x] Diff Scope: <N> files touched (+X / -Y lines, 0 opportunistic refactors)
- [x] Known Limitations / Notes: <none or list>
```

