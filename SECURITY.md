# Security Policy

The SG Forge maintainers take security, zero-trust isolation, and tenant privacy seriously. This document outlines our vulnerability disclosure policy and security commitments.

---

## 🔒 Reporting a Vulnerability

If you believe you have discovered a security vulnerability in SG Forge, please **do NOT report it through public GitHub issues or public discussions**.

Instead, please send a responsible disclosure report via email:

* **Primary Security Contact**: `sanketghodke03@gmail.com`
* **Subject Format**: `[SECURITY VULNERABILITY] <Component/App> - <Brief Description>`

Please include as much detail as possible in your report:
1. Affected component, micro-app, or API route.
2. Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
3. Potential impact (e.g. privilege escalation, token replay, cross-tenant leak).
4. Any proposed remediations.

We will acknowledge receipt of your report, investigate the finding, and coordinate any patch before public disclosure.

---

## ⚠️ Disclaimer of Warranty & Service Level Agreement (SLA)

SG Forge is developed and published as free and open-source software under the **Apache License, Version 2.0**. 

1. **No Commercial SLA**: The software is maintained on an "AS IS" and "AS AVAILABLE" basis without any express or implied warranties or guaranteed service response times for vulnerability remediations or bug fixes.
2. **No Bug Bounty Program**: This repository does not operate a paid monetary bug bounty program. Contributors and security researchers are acknowledged in release notes and commit history.
3. **Operational Assumption of Risk**: Operators deploying SG Forge in production environments assume full operational responsibility for testing, configuring, network isolation, and firewalling their deployments.
