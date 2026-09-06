/**
 * @forge/ui - HTML Entity & Attribute Sanitization Utilities (2026 LTS)
 * ASVS 5.0 & OWASP Top 10 XSS / Injection Defense.
 */

/**
 * Sanitizes unsafe HTML characters preventing Cross-Site Scripting (XSS).
 * @requirements [HLR-UI-401] [LLR-UI-008]
 */
export function escapeHtml(input: string | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str.replace(/[&<>'"]/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case "'":
        return '&#39;';
      case '"':
        return '&quot;';
      default:
        return char;
    }
  });
}

/**
 * Validates and sanitizes a local redirect URL to prevent open redirection.
 * @requirements [HLR-UI-401] [LLR-UI-008]
 */
export function sanitizeLocalUrl(url: string | null | undefined, fallback: string = '/portal'): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\') && !trimmed.includes('://') && !trimmed.includes('\\')) {
    return trimmed === '/' ? fallback : trimmed;
  }
  return fallback;
}
