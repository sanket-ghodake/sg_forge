/**
 * @forge/ui - Astryx Theme Tokens (2026 LTS)
 * Design Tokens for Dark and Light themes across the SG Forge Platform.
 */

/**
 * Astryx theme tokens defining CSS custom property variables for dark and light palettes.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export const themeTokens = {
  dark: {
    bgRoot: '#121212',
    bgSurface: '#171717',
    bgCard: '#1c1c1c',
    bgCardHover: '#232323',
    bgElevated: '#191919',
    borderSubtle: '#282828',
    borderMedium: '#383838',
    primary: '#3ecf8e',
    primaryGradient: 'linear-gradient(135deg, #3ecf8e 0%, #24b47e 100%)',
    accent: '#7053ff',
    textMain: '#ededed',
    textMuted: '#8a8a8a',
    textSubtle: '#606060',
    textContrast: '#ffffff',
    success: '#3ecf8e',
    successBg: 'rgba(62, 207, 142, 0.12)',
    shadowCard: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
    shadowHover: '0 6px 20px -4px rgba(0, 0, 0, 0.5)',
  },
  light: {
    bgRoot: '#fafafa',
    bgSurface: '#ffffff',
    bgCard: '#ffffff',
    bgCardHover: '#f5f5f5',
    bgElevated: '#f7f7f8',
    borderSubtle: '#eaeaea',
    borderMedium: '#d8d8d8',
    primary: '#24b47e',
    primaryGradient: 'linear-gradient(135deg, #24b47e 0%, #1ea672 100%)',
    accent: '#6366f1',
    textMain: '#171717',
    textMuted: '#666666',
    textSubtle: '#8c8c8c',
    textContrast: '#ffffff',
    success: '#1ea672',
    successBg: 'rgba(36, 180, 126, 0.10)',
    shadowCard: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
    shadowHover: '0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
  },
};
