# 24/7 Systemd Service & Linux Daemon Automation

This directory contains production systemd unit templates and automated installation scripts to run SG Forge 24/7 as an operating system service on Ubuntu, Debian, and systemd-enabled Linux environments.

---

## 📁 Files

- `sg-forge.service`: Systemd service unit definition configuring clean startup, graceful shutdown, and container dependency ordering.
- `install-service.sh`: Automated 1-click installer that populates the repository working directory, registers the unit into `/etc/systemd/system/`, and enables boot autostart.

---

## 🚀 Usage

```bash
# 1. Install and enable on boot
sudo bash scripts/systemd/install-service.sh

# 2. Control service lifecycle
sudo systemctl start sg-forge.service
sudo systemctl status sg-forge.service
sudo systemctl stop sg-forge.service
```
