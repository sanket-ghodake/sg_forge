# Kubernetes Base Manifests

Base declarative manifests defining Deployments, ClusterIP Services, PVCs, and Gateway ingress for all SG Forge platform microservices.

## Security Baseline & Hardening Standards
All platform deployments in this directory comply with the Kubernetes **Restricted Pod Security Standard**:
1. **Unprivileged Non-Root Execution**: `runAsNonRoot: true`, `runAsUser: 10001`, `runAsGroup: 10001`, `fsGroup: 10001`.
2. **Immutable Filesystem Protection**: `readOnlyRootFilesystem: true` across all containers; writable scratch space uses dedicated `emptyDir` volumes mounted at `/tmp`.
3. **Capabilities Zero-Trust**: `capabilities.drop: ["ALL"]` and `allowPrivilegeEscalation: false`.
4. **Namespace Isolation**: Deployed strictly under the dedicated `forge-system` namespace.
5. **Deterministic Versioning**: All container images reference semantic release tags (`v2.0.0`) avoiding mutable `:latest` tags.

## Manifests Included
- `caddy-gateway.yaml`: Unified reverse proxy gateway (Ports 80/443 mapping to internal unprivileged 8080/8443).
- `auth.yaml`: Central Identity & Auth service with `auth.db` PVC.
- `portal.yaml`: Main Portal workspace with `portal.db` PVC.
- `landing.yaml`: Platform Landing & Discovery Hub.
- `dev-dashboard.yaml`: Developer Monitoring Dashboard.
- `dev-hub.yaml`: Developer Hub & SDK Playground.
- `app-telemetry.yaml`: Telemetry micro-app with `turso_telemetry.db` PVC.
- `kustomization.yaml`: Base Kustomize resource index with `namespace: forge-system`.
