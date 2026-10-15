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
            // Report every source file, untested ones included — like PHPUnit's <source>.
            include: ['src/**/*.{js,vue}'],
            // Vitest's defaults, plus the text table written to a file for the CI job summary.
            reporter: ['text', 'html', 'clover', 'json', ['text', { file: 'coverage.txt' }]],
        },
    },
});
