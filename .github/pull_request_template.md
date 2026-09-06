## Description
Briefly describe the change and its architectural intent.

## Architectural Layer
- [ ] Core Backend / API / Services (`apps/src/`)
- [ ] Database Schema / Migrations (`apps/src/db/`)
- [ ] Frontend Portal / Shell / UI (`apps/src/portal/`)
- [ ] Astryx Design System (`apps/src/ui/`)
- [ ] Autonomous Forge Micro-Apps (`forge-apps/*`)
- [ ] Platform SDK (`apps/src/sdk/`)
- [ ] Scripts / Toolchain (`scripts/`, `portables/`)

## 📜 Legal & Contributor Certification (DCO 1.1)
- [ ] **Developer Certificate of Origin (DCO 1.1)**: I certify that this contribution was created in whole or in part by me, and I have the right to submit it under the Apache-2.0 License.
- [ ] **Signed-off-by Trailer**: All commits in this pull request include a valid `Signed-off-by: Author <email>` trailer (`git commit -s`).
- [ ] **Apache License 2.0 Compliance**: I understand that this work is dedicated to the public open-source project under Apache-2.0 with zero proprietary encumbrances.
- [ ] **Zero Corporate Work-for-Hire Bleed**: I confirm that no proprietary employer code, trade secrets, confidential tokens, or employer-specific usernames are present in this contribution.

## ⚡ Quality & Compliance Gate Checklist
- [ ] **Strict File Size Cap**: All modified/new files are $\le 500$ lines ($\le 300$ lines ideal).
- [ ] **Clean Package Aliases**: Zero relative traversal (`../../..`); all imports use `@forge/sdk`, `@forge/ui`, `@forge/types`.
- [ ] **Header Comment Blocks**: Header comment block with TSDoc and `@requirements` tag included on all exported symbols.
- [ ] **Astryx Design Tokens**: All UI elements strictly consume `@forge/ui` tokens with 100% dark/light theme parity.
- [ ] **Zero-Trust Security**: No hardcoded credentials, SQL injection vectors, or unredacted PII in logs.
- [ ] **5-Tier Verification Gate**: All 29 deterministic checks and 8 AI semantic audits pass via `rtk bun scripts/verify-gate.ts` / `./run.sh verify`.
- [ ] **Per-Conversation Worklog**: Single-line entry appended to `logs/WORKLOGS.md` outside working hours.
