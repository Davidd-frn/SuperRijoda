import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  return {
    plugins: [react()],

    // Dev runs at root, build targets GitHub Pages under /game/
    base: isDev ? '/' : '/game/',
    build: {
      outDir: 'docs',
    },
  }
})
