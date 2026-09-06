# Platform Deployment & Cloud-Native Orchestration (2026 LTS)

This directory contains cloud-native infrastructure, deployment engines, and operations scripts for SG Forge.

## Directory Structure
- `deploy-prod.sh`: Resilient zero-downtime production deployment engine with selective microservice detection, pre-deployment database snapshots, background builds, and automated self-healing rollback.
- `rollback-prod.sh`: 1-command instant rollback engine to stable commit baseline (`last-known-good`) with optional database restoration (`--restore-db`).
- `status-prod.sh`: Production diagnostic tool reporting gateway health, active container status, database snapshots, and deployment audit logs.
- `k8s/`: Declarative Kubernetes manifests using Kustomize (Base + Overlays for `dev` and `prod`).

## Single-Machine Dev vs Prod Operations

### 1. Ingress Port Separation
- **Production Stack**: Listens on **Port 80** (`:80`) and **Port 443** (`:443`). Internal colleagues browse to `http://<machine-ip>/`.
- **Development Stack**: Listens on **Port 8080** (`:8080`) and **Port 8443** (`:8443`). You test development locally at `http://localhost:8080/`.

### 2. Operational Workflows
```bash
# Check production health & recent deployment history
./run.sh prod-status

# Deploy latest changes to production with selective microservice updates
./run.sh deploy-prod

# Rollback production to previous verified stable baseline
./run.sh rollback-prod

# Rollback production and restore pre-deployment database snapshot
./run.sh rollback-prod --restore-db
```
