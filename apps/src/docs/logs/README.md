# Logs - @forge/docs

This directory stores operational structured JSON logs for the `@forge/docs` core microservice.

- Logs follow Enterprise SRE JSON format with `timestamp`, `level`, `service: "docs"`, `traceId`, and automated secret/PII redaction.
- Rolling rotation limit: 5MB per log file.
