#!/usr/bin/env node
/**
 * Convert a kbdlayout.info Windows keyboard XML export into a TypeScript
 * KeyboardLayoutMap module matching this repo's layout file style.
 *
 * Provenance
 * ----------
 * This library's older layout modules were captured with Chrome's
 * `navigator.keyboard.getLayoutMap()` (see comment in `src/layouts/index.ts`).
 * We do not have physical Brazilian / Canadian French machines here, so the
 * new maps are *derived* from public Microsoft KBDTABLES dumps mirrored by
 * https://kbdlayout.info (XML download), not from a live Chrome dump.
 *
 * Dead keys: kbdlayout.info exposes the dead-key accent glyph in
 * `DeadKeyTable/@Accent`. That matches how existing modules in this repo
 * store accents (e.g. Portuguese `BracketRight = '´'`), rather than the
 * WICG Keyboard Map "standalone equivalent" table (acute → U+0027).
 *
 * Usage
 * -----
 *   # Download XML (examples):
 *   curl -sL https://kbdlayout.info/KBDBR/download/xml -o scripts/data/kbdbr.xml
 *   curl -sL https://kbdlayout.info/KBDCA/download/xml -o scripts/data/kbdca.xml
 *
 *   # Generate TypeScript modules:
 *   node scripts/build-layout-from-kbdlayout-xml.mjs \
 *     --xml scripts/data/kbdbr.xml --name Brazilian --out src/layouts/Brazilian.ts
 *   node scripts/build-layout-from-kbdlayout-xml.mjs \
 *     --xml scripts/data/kbdca.xml --name CanadianFrench --out src/layouts/CanadianFrench.ts
 *
 * Chrome dump path (alternative input)
 * ------------------------------------
 * If you later capture a real Chrome dump, save it as JSON:
 *   JSON.stringify([...await navigator.keyboard.getLayoutMap().entries()].sort())
 * then run:
 *   node scripts/build-layout-from-kbdlayout-xml.mjs \
 *     --chrome-dump path/to/dump.json --name MyLayout --out src/layouts/MyLayout.ts
 *
 * Sources used for the layouts added in this PR
 * ---------------------------------------------
 * - Brazilian (ABNT2): https://kbdlayout.info/KBDBR
 *   (Windows KBDBR.DLL / KLID 00000416 & 00010416)
 *   Microsoft docs: https://learn.microsoft.com/en-us/globalization/keyboards/kbdbr_2
 * - CanadianFrench: https://kbdlayout.info/KBDCA
 *   (Windows KBDCA.DLL / KLID 00001009 — display name "Canadian French")
 *   Microsoft docs: https://learn.microsoft.com/en-us/globalization/keyboards/kbdca
 */

import fs from 'node:fs'
import path from 'node:path'

/** Windows PS/2 set-1 scancode → UI Events `code` (Writing System Keys). */
const SC_TO_CODE = new Map([
  [0x29, 'Backquote'],
  [0x02, 'Digit1'],
  [0x03, 'Digit2'],
  [0x04, 'Digit3'],
  [0x05, 'Digit4'],
  [0x06, 'Digit5'],
  [0x07, 'Digit6'],
  [0x08, 'Digit7'],
  [0x09, 'Digit8'],
  [0x0a, 'Digit9'],
  [0x0b, 'Digit0'],
  [0x0c, 'Minus'],
  [0x0d, 'Equal'],
  [0x10, 'KeyQ'],
  [0x11, 'KeyW'],
  [0x12, 'KeyE'],
  [0x13, 'KeyR'],
  [0x14, 'KeyT'],
  [0x15, 'KeyY'],
  [0x16, 'KeyU'],
  [0x17, 'KeyI'],
  [0x18, 'KeyO'],
  [0x19, 'KeyP'],
  [0x1a, 'BracketLeft'],
  [0x1b, 'BracketRight'],
  [0x2b, 'Backslash'],
  [0x1e, 'KeyA'],
  [0x1f, 'KeyS'],
  [0x20, 'KeyD'],
  [0x21, 'KeyF'],
  [0x22, 'KeyG'],
  [0x23, 'KeyH'],
  [0x24, 'KeyJ'],
  [0x25, 'KeyK'],
  [0x26, 'KeyL'],
  [0x27, 'Semicolon'],
  [0x28, 'Quote'],
  [0x2c, 'KeyZ'],
  [0x2d, 'KeyX'],
  [0x2e, 'KeyC'],
  [0x2f, 'KeyV'],
  [0x30, 'KeyB'],
  [0x31, 'KeyN'],
  [0x32, 'KeyM'],
  [0x33, 'Comma'],
  [0x34, 'Period'],
  [0x35, 'Slash'],
  [0x56, 'IntlBackslash'],
  [0x73, 'IntlRo'],
  [0x7d, 'IntlYen'],
])

/**
 * Preferred key order — matches existing modules (US.ts / Portuguese.ts).
 * Keys absent from the source map are omitted.
 */
const KEY_ORDER = [
  'Backquote',
  'Backslash',
  'BracketLeft',
  'BracketRight',
  'Comma',
  'Digit0',
  'Digit1',
  'Digit2',
  'Digit3',
  'Digit4',
  'Digit5',
  'Digit6',
  'Digit7',
  'Digit8',
  'Digit9',
  'Equal',
  'IntlBackslash',
  'IntlRo',
  'IntlYen',
  'KeyA',
  'KeyB',
  'KeyC',
  'KeyD',
  'KeyE',
  'KeyF',
  'KeyG',
  'KeyH',
  'KeyI',
  'KeyJ',
  'KeyK',
  'KeyL',
  'KeyM',
  'KeyN',
  'KeyO',
  'KeyP',
  'KeyQ',
  'KeyR',
  'KeyS',
  'KeyT',
  'KeyU',
  'KeyV',
  'KeyW',
  'KeyX',
  'KeyY',
  'KeyZ',
  'Minus',
  'Period',
  'Quote',
  'Semicolon',
  'Slash',
]

function parseArgs(argv) {
  const out = {}
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--xml') out.xml = argv[++i]
    else if (a === '--chrome-dump') out.chromeDump = argv[++i]
    else if (a === '--name') out.name = argv[++i]
    else if (a === '--out') out.out = argv[++i]
    else if (a === '--help' || a === '-h') out.help = true
    else throw new Error(`Unknown argument: ${a}`)
  }
  return out
}

function unescapeXml(text) {
  return text
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
}

function parseKbdlayoutXml(xmlText) {
  const map = new Map()
  // Each <PK ... SC="HH" ...> ... </PK>
  // Self-closing <PK ... /> entries (modifiers, etc.) must not be treated as
  // open tags — otherwise [^>]* eats the trailing slash and the next key's
  // </PK> closes the match (e.g. VK_LCONTROL swallowing VK_A).
  const pkRe = /<PK\b([^>]*?)\/>|<PK\b([^>]*)>([\s\S]*?)<\/PK>/g
  let m
  while ((m = pkRe.exec(xmlText))) {
    if (m[1] != null) continue // self-closing
    const attrs = m[2]
    const body = m[3]
    const scMatch = /\bSC="([0-9A-Fa-f]+)"/.exec(attrs)
    if (!scMatch) continue
    const code = SC_TO_CODE.get(Number.parseInt(scMatch[1], 16))
    if (!code) continue

    // Unshifted result: first <Result> without a With= attribute.
    // Parse tags with a tokenizer that allows `/` inside quoted attrs
    // (e.g. Text="/") and still detects `/>` self-closing.
    const resultRe = /<Result\b((?:[^>"']|"[^"]*"|'[^']*')*)(?:\/>|>([\s\S]*?)<\/Result>)/g
    let r
    let value
    while ((r = resultRe.exec(body))) {
      const rAttrs = r[1]
      const rBody = r[2] ?? ''
      if (/\bWith=/.test(rAttrs)) continue

      const textAttr = /\bText="([^"]*)"/.exec(rAttrs)
      const cps = /\bTextCodepoints="([^"]*)"/.exec(rAttrs)
      const dead = /<DeadKeyTable\b([^>]*)>/.exec(rBody)
      if (textAttr) value = unescapeXml(textAttr[1])
      else if (cps) {
        value = cps[1]
          .trim()
          .split(/\s+/)
          .map((h) => String.fromCodePoint(Number.parseInt(h, 16)))
          .join('')
      } else if (dead) {
        const accent = /\bAccent="([^"]*)"/.exec(dead[1])
        value = accent ? unescapeXml(accent[1]) : undefined
      }
      break
    }
    if (value != null && value !== '') map.set(code, value)
  }
  return map
}

function parseChromeDump(jsonText) {
  const entries = JSON.parse(jsonText)
  if (!Array.isArray(entries)) {
    throw new TypeError('Chrome dump must be a JSON array of [code, value] pairs')
  }
  return new Map(entries)
}

function jsStringLiteral(value) {
  // Prefer the quoting style used by existing layout modules.
  const json = JSON.stringify(value)
  if (value.includes("'") && !value.includes('"')) {
    return json // already double-quoted
  }
  // Convert JSON's double-quoted string into a single-quoted literal.
  const inner = json
    .slice(1, -1)
    .replaceAll(String.raw`\"`, '"')
    .replaceAll("'", String.raw`\'`)
  return `'${inner}'`
}

function renderModule(name, map) {
  const lines = []
  lines.push(`import type { KeyboardLayoutMap } from '../types'`)
  lines.push('')
  lines.push(`export const ${name}: KeyboardLayoutMap = new Map([`)
  for (const key of KEY_ORDER) {
    if (!map.has(key)) continue
    lines.push(`  ['${key}', ${jsStringLiteral(map.get(key))}],`)
  }
  // Any unexpected codes (should be rare) — append sorted for stability.
  const extras = [...map.keys()].filter((k) => !KEY_ORDER.includes(k)).sort()
  for (const key of extras) {
    lines.push(`  ['${key}', ${jsStringLiteral(map.get(key))}],`)
  }
  lines.push(`])`)
  lines.push('')
  return lines.join('\n')
}

function main() {
  const args = parseArgs(process.argv)
  if (args.help || (!args.xml && !args.chromeDump) || !args.name || !args.out) {
    console.error(`Usage:
  node scripts/build-layout-from-kbdlayout-xml.mjs --xml <file.xml> --name <ExportName> --out <file.ts>
  node scripts/build-layout-from-kbdlayout-xml.mjs --chrome-dump <dump.json> --name <ExportName> --out <file.ts>`)
    process.exit(args.help ? 0 : 1)
  }

  let map
  if (args.chromeDump) {
    map = parseChromeDump(fs.readFileSync(args.chromeDump, 'utf8'))
  } else {
    map = parseKbdlayoutXml(fs.readFileSync(args.xml, 'utf8'))
  }

  const sourceNote = args.chromeDump
    ? `Chrome getLayoutMap dump: ${args.chromeDump}`
    : `kbdlayout.info XML: ${args.xml}`

  const body = renderModule(args.name, map)
  fs.mkdirSync(path.dirname(args.out), { recursive: true })
  fs.writeFileSync(args.out, body)
  console.log(`Wrote ${args.out} (${map.size} keys) from ${sourceNote}`)
}

main()
