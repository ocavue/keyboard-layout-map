# Layout generation scripts

## `build-layout-from-kbdlayout-xml.mjs`

Converts public keyboard layout data into TypeScript `KeyboardLayoutMap` modules.

### Inputs

1. **kbdlayout.info XML** (Windows KBDTABLES dump), e.g.:

   ```bash
   curl -sL https://kbdlayout.info/KBDBR/download/xml -o scripts/data/kbdbr.xml
   curl -sL https://kbdlayout.info/KBDCA/download/xml -o scripts/data/kbdca.xml
   node scripts/build-layout-from-kbdlayout-xml.mjs \
     --xml scripts/data/kbdbr.xml --name Brazilian --out src/layouts/Brazilian.ts
   node scripts/build-layout-from-kbdlayout-xml.mjs \
     --xml scripts/data/kbdca.xml --name CanadianFrench --out src/layouts/CanadianFrench.ts
   ```

2. **Chrome `getLayoutMap()` dump** (preferred when you have the physical layout):

   ```js
   JSON.stringify([...(await navigator.keyboard.getLayoutMap().entries())].sort())
   ```

   ```bash
   node scripts/build-layout-from-kbdlayout-xml.mjs \
     --chrome-dump dump.json --name MyLayout --out src/layouts/MyLayout.ts
   ```

Checked-in XML under `scripts/data/` is the exact input used to generate Brazilian and CanadianFrench in this repository.
