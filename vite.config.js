import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

const externalPackages = [
  'vue',
  'axios',
  '@tiptap/vue-3',
  '@tiptap/starter-kit',
  '@tiptap/extension-image',
  '@tiptap/extension-table',
  '@tiptap/extension-table-row',
  '@tiptap/extension-table-cell',
  '@tiptap/extension-table-header',
  '@tiptap/extension-link',
  'vue3-popper',
  'vue-final-modal',
  '@kyvg/vue3-notification',
  'vue3-cookies',
  '@vuepic/vue-datepicker',
  'vue3-dropzone',
  'dayjs',
  'vee-validate',
  '@vee-validate/rules',
  '@vee-validate/i18n',
  'vue-multiselect',
];

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'Craftable',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: (id) => {
        return externalPackages.some(
          (pkg) => id === pkg || id.startsWith(pkg + '/')
        );
      },
      output: {
        globals: {
          vue: 'Vue',
          axios: 'axios',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@dejwcake/craftable': resolve(__dirname, 'src/index.js'),
      '@': resolve(__dirname, 'src'),
    },
  },
});
