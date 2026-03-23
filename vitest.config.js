import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@dejwcake/craftable': resolve(__dirname, 'src/index.js'),
            '@': resolve(__dirname, 'src'),
        },
    },
    test: {
        environment: 'happy-dom',
        setupFiles: ['./tests/setup.js'],
        include: ['tests/**/*.test.js'],
        coverage: {
            reportsDirectory: './tests/coverage',
        },
    },
});
