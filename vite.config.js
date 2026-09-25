import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: '/dspgame/', // 必须与你的 GitHub 仓库名完全一致
});