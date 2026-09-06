# Kubernetes Fleet Orchestration (Kustomize Architecture)

Declarative, cloud-native Kubernetes manifests for orchestrating the SG Forge microservice fleet.

## Structure
- `base/`: Universal Kubernetes Deployments, ClusterIP Services, PVCs, and Ingress Gateway definitions.
- `overlays/dev/`: Development environment customization (local storage, lightweight quotas).
- `overlays/prod/`: Production environment customization (high-availability, persistent SSD storage, strict quotas).

## Usage
```bash
# Preview rendered Kubernetes manifests
kubectl kustomize deploy/k8s/overlays/dev
kubectl kustomize deploy/k8s/overlays/prod

# Apply to cluster
kubectl apply -k deploy/k8s/overlays/prod
```
