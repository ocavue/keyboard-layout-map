import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    layouts: 'src/layouts/index.ts',
    types: 'src/types.ts',
  },
  format: ['esm'],
  dts: { build: true },
  fixedExtension: false,
})
