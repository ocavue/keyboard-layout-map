import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/layouts.ts', 'src/types.ts'],
  format: ['esm'],
  clean: true,
  dts: true,
})
