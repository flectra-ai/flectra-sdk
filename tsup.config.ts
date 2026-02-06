import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'robot/index': 'src/robot/index.ts',
    'attestation/index': 'src/attestation/index.ts',
    'merkle/index': 'src/merkle/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: false, // TODO: Fix viem type compatibility
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  minify: false,
})
