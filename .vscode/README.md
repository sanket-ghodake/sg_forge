# 💻 VS Code Workspace Configuration (`.vscode/`)

This directory contains recommended workspace settings for Visual Studio Code and compatible editors (Cursor, Windsurf, VSCodium).

---

## ⚙️ Configuration Files

* **`settings.json`**: Pre-configures terminal environment variables so that the portable toolchain (`portables/bin` and `portables/bun/bin`) is automatically active on `$PATH` in all integrated terminals without requiring host-level modifications.
  * `terminal.integrated.env.linux`: Prepends `${workspaceFolder}/portables/bin` and Bun bin.
  * `terminal.integrated.env.osx`: Prepends `${workspaceFolder}/portables/bin` and Bun bin.
  * `terminal.integrated.env.windows`: Prepends `${workspaceFolder}\portables\bin` and Bun bin.
