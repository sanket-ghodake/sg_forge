/**
 * @forge/ui - Astryx Design System Stylesheet Hub (2026 LTS)
 * Combines Base tokens/scrollbars, Component primitives/header, and Overlay dialogs/toasts.
 */

import { themeTokens } from './tokens';
import { getBaseStyles } from './styles/base';
import { getComponentStyles } from './styles/components';
import { getOverlayStyles } from './styles/overlays';

export { themeTokens };

/**
 * Returns complete Astryx CSS stylesheet with dynamic theme custom properties,
 * custom scrollbars, sticky enterprise header, modern dropdowns, modals, and toasts.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function getAstryxStyles(): string {
  return `
    ${getBaseStyles()}
    ${getComponentStyles()}
    ${getOverlayStyles()}
  `;
}
