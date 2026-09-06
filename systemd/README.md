# ⚙️ Linux Systemd Service Units (`systemd/`)

This directory contains systemd service configuration templates for host-level process management.

## 📌 Services
- **`sg-forge-fallback.service`**: Standalone Host Fallback Server (Approach A).
  - Automatically runs when the main Docker/Caddy stack is offline.
  - Listens on HTTP Port 80 and serves `proxy/errors/503.html` (pre-rendered Astryx maintenance screen).
  - Uses the portable Bun runtime with zero external dependencies.
- **`sg-db-backup.service`**: Continuous Production Database Backup Daemon.
  - Automatically runs hourly atomic snapshots (`VACUUM INTO`) across all platform databases.
  - Verifies database integrity (`PRAGMA integrity_check`) post-backup.
  - Automatically manages rolling retention windows and optional AES-256-GCM encryption.

## 🚀 Installation & Usage (Optional Production Automation)
1. Copy the unit file into `/etc/systemd/system/`:
   ```bash
   sudo cp systemd/sg-forge-fallback.service /etc/systemd/system/
   sudo systemctl daemon-reload
   ```
2. Start the fallback service manually or on demand:
   ```bash
   sudo systemctl start sg-forge-fallback
   ```
3. Check service status:
   ```bash
   sudo systemctl status sg-forge-fallback
   ```
