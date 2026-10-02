import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@dejwcake/craftable': resolve(import.meta.dirname, 'src/index.js'),
            '@': resolve(import.meta.dirname, 'src'),
        },
    },
    test: {
        environment: 'happy-dom',
        setupFiles: ['./tests/setup.js'],
        // Node's built-in Web Storage would shadow happy-dom's localStorage and warn without --localstorage-file.
        execArgv: ['--no-experimental-webstorage'],
        include: ['tests/**/*.test.js'],
        coverage: {
            reportsDirectory: './tests/coverage',
        },
    },
});
