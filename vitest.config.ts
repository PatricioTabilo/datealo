import vue from '@vitejs/plugin-vue'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'node',
    // Sin esto, un worktree de discovery vivo bajo .claude/worktrees/ (mismo árbol que el repo) duplica
    // cada test — vitest no excluye esa carpeta por default.
    exclude: [...configDefaults.exclude, '.claude/worktrees/**'],
  },
})
