# 📦 Database Backups (`backups/`)

This directory is the canonical destination for automated production database snapshots created by `scripts/backup-databases.ts`.

## 📌 Structure
- **`db/`**: Timestamped snapshot folders (`snapshot_YYYY-MM-DDTHH-mm-ss-sssZ/`), each containing core platform databases:
  - `auth.db` (or `auth.db.enc`)
  - `portal.db`
  - `platform_core.db`
  - `dev_hub.db`
  - `manifest.json`: Verification telemetry, SHA-256 hashes, file sizes, and integrity check results.

> ℹ️ **Forge App Isolation**: Autonomous Forge Apps (`forge-apps/*`) manage their own dedicated database backups locally in `forge-apps/<app>/backups/db/`. The root repository engine strictly backs up core platform databases.

## 🛡️ Guarantees
1. **Atomic Live Snapshots**: Uses SQLite's `VACUUM INTO` command to produce consistent, non-corrupted point-in-time copies without downtime or table locks.
2. **Post-Backup Verification**: Automatically validates `PRAGMA integrity_check;` and `PRAGMA foreign_key_check;` before recording success.
3. **Retention Pruning**: Automatically rotates backups based on `DB_BACKUP_RETENTION_HOURS` (default: 168 hours / 7 days).
4. **Git Ignored**: This entire directory is ignored by version control to prevent data leaks.
