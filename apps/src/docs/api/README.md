# 📑 SG Forge API Specifications

This directory houses the OpenAPI 3.1 contracts and API interface definitions for the SG Forge platform services.

## Contents
* [`openapi.yaml`](./openapi.yaml): Canonical OpenAPI 3.1 specification for core gateway routes and healthcheck endpoints.

## Validation & Linting
API contracts are continuously validated against `.spectral.yaml` using Spectral and Schemathesis:
```bash
./run.sh contracts
# or
./portables/bin/spectral lint apps/src/docs/api/openapi.yaml
```
