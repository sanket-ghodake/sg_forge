# Docker Configuration - @forge/docs

This directory contains the production container specification for the `@forge/docs` core microservice.

- `Dockerfile`: Multi-stage Alpine Bun image running in air-gapped `core-airgap-net` with non-root security context and dual-probe `HEALTHCHECK`.
