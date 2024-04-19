# keyboard-layout-map

[![NPM version](https://img.shields.io/npm/v/keyboard-layout-map?color=a1b858&label=)](https://www.npmjs.com/package/keyboard-layout-map)

Utils for experimental Web [`KeyboardLayoutMap`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardLayoutMap) API.

## Install

```bash
npm install keyboard-layout-map
```

## Usage

Get the current keyboard layout.

```ts
import { getKeyboardLayout } from 'keyboard-layout-map'

const layout = await getKeyboardLayout()
//     ^: KeyboardLayoutMap | null
```

Identify the current keyboard layout.

```ts
import { identifyKeyboardLayout } from 'keyboard-layout-map'

const name = await identifyKeyboardLayout(layout)
//     ^: "US" | "French" | "German" | "LatinAmerican" ...
```

Get all supported keyboard layouts (for testing purposes).

```ts
import * as layouts from 'keyboard-layout-map/layouts'

const ItalianLayout = layouts['Italian']
//     ^: KeyboardLayoutMap

const SlovakLayout = layouts['Slovak']
//     ^: KeyboardLayoutMap
```

## License

MIT
