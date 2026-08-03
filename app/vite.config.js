import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the build works from any subpath (e.g. a GitHub Pages
  // project site at username.github.io/repo-name/) without hardcoding the
  // repo name here — this app has no client-side router, so relative asset
  // URLs are all it needs.
  base: './',
})
