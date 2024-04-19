import type { KeyboardLayoutMap } from './types'

interface Keyboard {
  getLayoutMap(): Promise<KeyboardLayoutMap>
}

interface Navigator {
  keyboard?: Keyboard
}

/**
 * Get the current keyboard layout map.
 */
export async function getKeyboardLayout(): Promise<KeyboardLayoutMap | null> {
  if (typeof window !== 'undefined') {
    const keyboard = (window.navigator as Navigator).keyboard
    if (keyboard) {
      return await keyboard.getLayoutMap()
    }
  }
  return null
}
