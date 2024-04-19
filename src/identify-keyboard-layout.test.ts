import { test, expect } from 'vitest'

import { identifyKeyboardLayout } from './identify-keyboard-layout'
import * as layouts from './layouts'

test('identifyKeyboardLayout', () => {
  const snapshot = Object.fromEntries(
    Object.entries(layouts).map(([name, map]) => [
      name,
      identifyKeyboardLayout(map),
    ]),
  )
  expect(snapshot).toMatchInlineSnapshot(`
    {
      "British": "US",
      "Danish": "Danish",
      "Finnish": "Finnish",
      "French": "French",
      "German": "SwissGerman",
      "Italian": "Italian",
      "LatinAmerican": "LatinAmerican",
      "Norwegian": "Norwegian",
      "Portuguese": "Portuguese",
      "Slovak": "Slovak",
      "Spanish": "Spanish",
      "Swedish": "Finnish",
      "SwissFrench": "SwissFrench",
      "SwissGerman": "SwissGerman",
      "US": "US",
      "USInternational": "US",
    }
  `)
})