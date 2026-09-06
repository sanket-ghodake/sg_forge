# 🐍 External Python Microservice Sample (`samples/external-python-service`)

Demonstrates how to integrate an external Python FastAPI backend into SG Forge with **Zero Code Changes** for authentication.

---

## 🚀 How to Run

1. Start Python server:
   ```bash
   python3 -m uvicorn main:app --port 8095
   ```
2. In `.env`, add:
   ```bash
   APP_PYTHON_AI="Python AI Inference|8095|/apps/python-ai|AI Services|Employee / Admin|host.docker.internal"
   ```
3. Sync Caddy routes:
   ```bash
   rtk bun scripts/generate-proxy.ts
   ```
4. Visit `http://localhost/apps/python-ai`:
   - If not logged in $\to$ Redirected to `/auth/login`.
   - If logged in $\to$ Gateway automatically injects `X-Forwarded-User` headers into the FastAPI request!
