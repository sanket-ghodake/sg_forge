# 📜 Isolated Microservice Logs

This directory contains the local, isolated runtime logs for this microservice.

## Files & Roles
- **`app.log`**: Backend server execution logs, HTTP routes, latencies, and RFC 7807 error problem details.
- **`browser.log`**: Client-side browser console errors, warnings, and unhandled window rejections.
- **`db.log`**: Turso libSQL/SQLite query executions, transaction commits, and slow query warnings ($>10\text{ms}$).
- **`docker.log`**: Container stdout/stderr lifecycle and crash records.

## Rotation & Retention Policy
- Max file size: 5 MB per log file.
- Rolling backups: Maximum 3 files (`*.log`, `*.log.1`, `*.log.2`).
- Total directory cap: $\le 25\text{ MB}$.
