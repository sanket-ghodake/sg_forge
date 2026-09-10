---
name: headroom
description: "Use Headroom for sub-millisecond context and prompt compression (SmartCrusher, CodeCompressor, Kompress) to reduce input token payload by 21%-57% before sending to models."
---

# /headroom

Local-first context and prompt compression engine for AI coding agents.

## When to use
- Measuring token compression savings on JSON responses, test logs, or large files (`rtk ./run.sh headroom compress <file>`)
- Verifying the status and health of the compression engine (`rtk ./run.sh headroom status`)
- Running a local compression proxy on port 8787 (`rtk ./run.sh headroom proxy`)
- Checking historical token reduction ratios (`rtk ./run.sh headroom stats`)

## Usage

```bash
# Check Headroom health and active compressors
rtk ./run.sh headroom status

# Test compression on a file or payload
rtk ./run.sh headroom compress <path/to/file>

# Start local compression proxy
rtk ./run.sh headroom proxy --port 8787

# View compression statistics
rtk ./run.sh headroom stats
```
