"""
SG Forge - External Python FastAPI Microservice Sample (2026 LTS)
Demonstrates 100% Zero-Code Gateway Authentication & Scoped Hierarchy Consumption.

Run:
  python3 -m uvicorn main:app --port 8095
"""

from typing import Optional
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
import requests

app = FastAPI(title="External Python ML & Analytics Service")

AUTH_SERVICE_URL = "http://auth:3004/api/v1/auth/hierarchy"


@app.get("/health")
def health_check():
    """Dual-probe healthcheck for Docker and Caddy gateway."""
    return {"status": "ok", "service": "external-python-service", "runtime": "Python 3.11+"}


@app.get("/api/ai/predict")
def predict(
    x_forwarded_user: Optional[str] = Header(None),
    x_forwarded_role: Optional[str] = Header(None),
    x_forwarded_org_path: Optional[str] = Header(None),
):
    """
    Protected AI prediction endpoint.
    Zero-code SSO: Gateway verified user before forwarding request.
    """
    if not x_forwarded_user:
        raise HTTPException(
            status_code=401,
            detail="Access Denied: Request must be routed through SG Forge Zero-Trust Gateway."
        )

    return {
        "status": "SUCCESS",
        "user": x_forwarded_user,
        "role": x_forwarded_role or "roles/employee",
        "department": x_forwarded_org_path or "/root",
        "prediction": "Optimal resource allocation: 98.4% efficiency",
    }


@app.get("/", response_class=HTMLResponse)
def index_page(
    x_forwarded_user: Optional[str] = Header("anonymous@forge.internal"),
    x_forwarded_role: Optional[str] = Header("Standard Access"),
):
    """Interactive Astryx-styled dashboard."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Python External Service - SG Forge</title>
  <style>
    body {{ background: #0f0f11; color: #ededed; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; padding: 2rem; }}
    .card {{ background: #19191c; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1.5rem; max-width: 650px; margin: 0 auto; }}
    .badge {{ background: rgba(62,207,142,0.12); color: #3ecf8e; border: 1px solid #3ecf8e; border-radius: 9999px; padding: 0.2rem 0.6rem; font-size: 0.8rem; font-weight: 600; }}
    .pill {{ background: #0f0f11; border: 1px solid rgba(255,255,255,0.08); color: #ededed; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem; margin-top: 0.5rem; }}
  </style>
</head>
<body>
  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h1 style="font-size: 1.35rem; margin: 0;">🐍 External Python Service</h1>
      <span class="badge">Zero-Code SSO Verified</span>
    </div>
    <p style="color: #94a3b8; font-size: 0.9rem; margin-top: 0.5rem;">
      This standalone Python service required <strong>0 lines of auth code</strong> to integrate into SG Forge.
    </p>
    <div class="pill">
      <strong>Injected User:</strong> {x_forwarded_user} &bull; <strong>Role:</strong> {x_forwarded_role}
    </div>
  </div>
</body>
</html>"""
