# ⚙️ Auth Backend Engine (`@forge/auth/backend`)

Central authentication, cryptographic operations, and GCP-style IAM policy evaluation engine.

## 🚀 Features
* **Asymmetric Ed25519 & JWKS**: Signs access tokens with private key; publishes public key via `/.well-known/jwks.json`.
* **Refresh Token Rotation (RTR)**: Single-use refresh token families with automated replay detection and instant family revocation.
* **Security Guardrail Ceilings & Clamping Engine**: Configurable via `.env` (`JWT_ACCESS_TOKEN_EXPIRY_SECONDS`, `JWT_REFRESH_TOKEN_EXPIRY_SECONDS`, `AUTH_ABSOLUTE_SESSION_MAX_SECONDS`) with strict code-enforced upper bounds (ceilings) and lower bounds (floors).
* **Absolute Session Max Lifetime**: Hard session family ceiling (`AUTH_ABSOLUTE_SESSION_MAX_SECONDS`, default 24h, max 7d) that blocks infinite perpetual sliding sessions and requires re-authentication.
* **GCP-Style Policy Evaluator**: Scoped permissions evaluation across the organizational hierarchy.
* **Password Complexity & Reset**: Enforces forced password setup on first login with entropy validation.
