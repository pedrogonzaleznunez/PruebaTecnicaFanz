import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.js'],
    exclude: ['node_modules', 'dist'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../seatmapbuilder'),
      '@lib': resolve(__dirname, '../seatmapbuilder/lib'),
      '@components': resolve(__dirname, '../seatmapbuilder/components'),
    },
  },
})
