#!/usr/bin/env bash
# ==============================================================================
# SG Forge - 24/7 Production Systemd Service Installer (Linux / Ubuntu)
# Configures SG Forge to automatically start at boot and recover across reboots.
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

ENV_PREFIX="forge"
if [ -f "$REPO_ROOT/.env" ]; then
  PROJECT_MATCH="$(grep -E '^PROJECT_NAME=' "$REPO_ROOT/.env" | head -n 1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)"
  [ -n "$PROJECT_MATCH" ] && ENV_PREFIX="$PROJECT_MATCH"
fi
SERVICE_NAME="${SYSTEMD_SERVICE_NAME:-${ENV_PREFIX}.service}"
TARGET_PATH="/etc/systemd/system/$SERVICE_NAME"
TEMPLATE_FILE="$SCRIPT_DIR/forge.service"
[ ! -f "$TEMPLATE_FILE" ] && TEMPLATE_FILE="$(ls "$SCRIPT_DIR"/*.service | head -n 1)"

echo "🚀 Installing 24/7 Host Service: $SERVICE_NAME..."

if [ "$EUID" -ne 0 ]; then
  echo "⚠️  This installer requires root privileges. Re-running with sudo..."
  exec sudo bash "$0" "$@"
fi

# 1. Generate customized service unit with actual repo path
sed "s|WorkingDirectory=.*|WorkingDirectory=$REPO_ROOT|" "$TEMPLATE_FILE" > "$TARGET_PATH"
chmod 644 "$TARGET_PATH"

# 2. Reload systemd daemon
systemctl daemon-reload

# 3. Enable service on boot
systemctl enable "$SERVICE_NAME"

echo "✅ $SERVICE_NAME successfully registered and enabled on system boot."
echo "💡 Commands:"
echo "   Start now : sudo systemctl start $SERVICE_NAME"
echo "   Status    : sudo systemctl status $SERVICE_NAME"
echo "   Stop      : sudo systemctl stop $SERVICE_NAME"
