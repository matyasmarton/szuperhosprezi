import { readFile } from 'node:fs/promises'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { parsePresentation } from './src/lib/parse.ts'

const lectureMarkdown: Plugin = {
  name: 'lecture-markdown',
  enforce: 'pre',
  async load(id) {
    const [file, query] = id.split('?')
    if (!file.endsWith('/prezi.md') || query !== 'presentation') return
    this.addWatchFile(file)
    return `export default ${JSON.stringify(parsePresentation(await readFile(file, 'utf8')))}`
  },
}

export default defineConfig({
  plugins: [lectureMarkdown, react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
})
