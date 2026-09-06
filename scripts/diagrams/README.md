# Diagram Design CLI & AST Scripts (`scripts/diagrams/`)

> **Offline Python Extractors & AST Linters for Diagram Design**

---

## 🧭 Script Overview

| Script | License | Description |
| :--- | :---: | :--- |
| `self_check.py` | MIT | Validates generated diagram HTML/SVG files against density budgets ($\le 4/10$), connector orthogonality, and label masking. |
| `mermaid_extract.py` | MIT | Parses legacy `.mmd` Mermaid source files and extracts node/edge ASTs for editorial redraws. |
| `drawio_extract.py` | MIT | Parses `.drawio` / `.drawio.png` XML trees and extracts geometry for editorial redraws. |

---

## 🚀 Execution

Run via the platform CLI wrapper:
```bash
rtk ./run.sh diagram:lint <diagram-file.html>
rtk ./run.sh diagram:convert-mermaid <file.mmd>
rtk ./run.sh diagram:convert-drawio <file.drawio>
```

All scripts use the standard Python library (`xml.etree.ElementTree`, `re`, `json`, `sys`) and require zero external host dependencies or pip packages.
