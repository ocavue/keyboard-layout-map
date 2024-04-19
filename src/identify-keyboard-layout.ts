import type { KeyboardLayoutMap } from './types'

/**
 * Identify the keyboard layout. It will return "US" if the layout is not recognized.
 *
 * References:
 * - https://support.apple.com/en-au/102743
 * - https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/windows-language-pack-default-values?view=windows-11
 */
export function identifyKeyboardLayout(map: KeyboardLayoutMap) {
  const semicolon = map.get('Semicolon')
  const bracketLeft = map.get('BracketLeft')
  const bracketRight = map.get('BracketRight')

  switch (semicolon) {
    case 'ç':
      return 'Portuguese'
    case 'é':
      return 'SwissFrench'
    case 'ø':
      return 'Norwegian'
    case 'æ':
      return 'Danish'
    case 'ô':
      return 'Slovak'
    case 'ò':
      return 'Italian'
    case 'ñ':
      return bracketLeft === '´' ? 'LatinAmerican' : 'Spanish'
    case 'ö':
      return bracketLeft === 'å'
        ? 'Finnish' // Finnish and Swedish use the same layout
        : bracketRight === '¨'
          ? 'SwissGerman'
          : 'German'
    case 'm':
      return 'French'
  }

  return 'US'
}
