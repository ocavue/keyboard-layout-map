/**
 * A read-only Map-like object with functions for retrieving the string
 * associated with specific physical keys.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardLayoutMap
 */
export interface KeyboardLayoutMap {
  get(key: string): string | undefined
  has(key: string): boolean
  size: number
  entries(): IterableIterator<[string, string]>
  keys(): IterableIterator<string>
  values(): IterableIterator<string>
  forEach(
    callbackfn: (value: string, key: string, map: KeyboardLayoutMap) => void,
    thisArg?: unknown,
  ): void
}
