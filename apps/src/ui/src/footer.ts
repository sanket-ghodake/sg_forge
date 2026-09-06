/**
 * @forge/ui - Astryx Universal Page Footer (2026 LTS)
 * Enterprise footer with automated copyright year, organization branding, and responsive metadata.
 */

/**
 * Options for configuring Astryx footer.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export interface AstryxFooterOptions {
  orgName?: string;
  year?: number;
  secondaryText?: string;
  className?: string;
  style?: string;
}

/**
 * Renders standard Astryx Page Footer with dynamic copyright, current year, and org name.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function getAstryxFooterHtml(options?: AstryxFooterOptions): string {
  const currentYear = options?.year || new Date().getFullYear();
  const org =
    options?.orgName ||
    process.env.NEXT_PUBLIC_ORG_NAME ||
    process.env.NEXT_PUBLIC_BRAND_NAME ||
    process.env.ORGANIZATION_NAME ||
    process.env.BRAND_NAME ||
    'SG Forge';
  const secondary =
    options?.secondaryText !== undefined
      ? options.secondaryText
      : 'Enterprise Workspace Platform &bull; Dynamic Service Registry';
  const customClass = options?.className || 'astryx-footer';
  const customStyle = options?.style ? ` style="${options.style}"` : '';

  return `<footer class="${customClass}"${customStyle}>&copy; ${currentYear} ${org}. All rights reserved.${secondary ? ` &bull; ${secondary}` : ''}</footer>`;
}
