#!/usr/bin/env bash
# ==============================================================================
# SG Forge - Modular Corporate Portal Engine
# ==============================================================================
# File:        .agents/hooks/validate-worklog.sh
# Domain:      Core
# Layer:       Source Module
# Description: Worklog formatting and integrity validator (Enterprise Standard).
# Standards:   POSIX Shell Strict Mode | Zero Host Modification
# ==============================================================================
set -euo pipefail

LOG_FILE="logs/WORKLOGS.md"

if [ ! -f "$LOG_FILE" ]; then
  echo "❌ Worklog file '$LOG_FILE' does not exist."
  exit 1
fi

LINE_NUMBER=0
ERRORS=0
ENTRIES=0

while IFS= read -r line || [ -n "$line" ]; do
  LINE_NUMBER=$((LINE_NUMBER + 1))
  
  # Allow top markdown header
  if [[ "$line" =~ ^# ]]; then
    continue
  fi

  # Check for blank lines
  if [ -z "$(echo "$line" | tr -d '[:space:]')" ]; then
    if [ "$LINE_NUMBER" -le 2 ]; then
      continue
    fi
    echo "❌ Line $LINE_NUMBER: Blank/empty lines are strictly prohibited in $LOG_FILE"
    ERRORS=$((ERRORS + 1))
    continue
  fi

  # Validate single-line regex: YYYY-MM-DD HH:mm | ...
  if ! [[ "$line" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}\ [0-9]{2}:[0-9]{2}\ \|\ .+$ ]]; then
    echo "❌ Line $LINE_NUMBER: Malformed entry in $LOG_FILE. Expected 'YYYY-MM-DD HH:mm | <brief>', got:"
    echo "   '$line'"
    ERRORS=$((ERRORS + 1))
  else
    ENTRIES=$((ENTRIES + 1))
  fi
done < "$LOG_FILE"

if [ "$ERRORS" -gt 0 ]; then
  echo "❌ Worklog validation failed with $ERRORS error(s)."
  exit 1
fi

echo "✓ Worklog validation passed ($ENTRIES entries verified across $LINE_NUMBER lines)."
exit 0