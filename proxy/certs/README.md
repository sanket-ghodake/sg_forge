# 🔐 TLS Certificates & Local PKI (`proxy/certs`)

This directory houses local development and intranet TLS/SSL certificates, keys, and private Certificate Authorities (CAs) used by the Caddy reverse proxy gateway.

---

## 🛑 Security & Git-Ignore Policy (Zero Leakage)
- All `.pem`, `.key`, `.crt`, and `.csr` files in this directory are **strictly git-ignored** by `proxy/certs/.gitignore` and the root `.gitignore`.
- Private keys (`key.pem`, `ca.key`) are generated with restricted filesystem permissions (`chmod 600`).
- **NEVER** remove the ignore rules or commit any private key to version control.

---

## 🛠️ Automated Setup & Management

### 1. Automatic Generation (Developer Setup)
Running the platform setup automatically provisions a dedicated local Root CA and wildcard TLS certificates:
```bash
rtk ./run.sh certs
# or as part of setup:
rtk ./run.sh setup
```

### 2. Files Produced
| File | Role | Description |
| :--- | :--- | :--- |
| `ca.crt` | **Root CA** | Self-signed Certificate Authority for your local/intranet environment |
| `ca.key` | **Root CA Key** | Private key used solely to sign internal certificates (`chmod 600`) |
| `cert.pem` | **Server Certificate** | TLS server certificate with Subject Alternative Names (SAN) |
| `key.pem` | **Server Key** | TLS private key loaded by Caddy reverse proxy (`chmod 600`) |

### 3. Subject Alternative Names (SAN)
Generated certificates automatically cover:
- `DNS:localhost`
- `IP:127.0.0.1`
- `IP:0.0.0.0`
- `DNS:*.internal`
- `DNS:*.local`
- Auto-detected local machine LAN IP (e.g. `192.168.x.x` or `10.x.x.x`) for intranet mobile/workstation testing.

---

## 🍏 1-Click OS Trust Installation
To eliminate browser warnings ("Your connection is not private") and achieve a clean green padlock:
```bash
rtk ./run.sh trust-cert
```
* On **Linux**: Installs `ca.crt` into `/usr/local/share/ca-certificates/` and updates system trust.
* On **macOS**: Installs `ca.crt` into System Keychain (`security add-trusted-cert`).
* On **Windows**: Installs `ca.crt` into `ROOT` certificate store via `certutil`.
