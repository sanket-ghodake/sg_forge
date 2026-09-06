# Kubernetes Base Manifests

Base declarative manifests defining Deployments, ClusterIP Services, PVCs, and Gateway ingress for all 8 SG Forge microservices.

## Manifests Included
- `caddy-gateway.yaml`: Unified reverse proxy gateway (Ports 80/443).
- `auth.yaml`: Central Identity & Auth service with `auth.db` PVC.
- `portal.yaml`: Main Portal workspace with `portal.db` PVC.
- `landing.yaml`: Platform Landing & Discovery Hub.
- `dev-dashboard.yaml`: Developer Monitoring Dashboard.
- `dev-hub.yaml`: Developer Hub & SDK Playground.
- `app-expenses.yaml`: Expenses micro-app with `turso_expenses.db` PVC.
- `app-billing.yaml`: Billing micro-app with `turso_billing.db` PVC.
- `app-telemetry.yaml`: Telemetry micro-app with `turso_telemetry.db` PVC.
- `kustomization.yaml`: Base Kustomize resource index.
