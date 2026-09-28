import { copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const r = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'juxt:copy-standalone-css',
      closeBundle() {
        copyFileSync(r('./src/styles/tokens.css'), r('./dist/tokens.css'))
        copyFileSync(r('./src/styles/tailwind.css'), r('./dist/tailwind.css'))
      },
    },
  ],
  build: {
    target: 'es2022',
    lib: {
      entry: { index: r('./src/index.ts'), editor: r('./src/editor/index.ts'), nuxt: r('./src/nuxt.ts') },
      formats: ['es'],
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['vue', '@floating-ui/dom', '@nuxt/kit', /^@tiptap\//, /^node:/],
    },
    minify: false,
    sourcemap: true,
  },
})
