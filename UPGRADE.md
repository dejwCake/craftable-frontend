# Upgrade Guide: v1 to v2

## Overview

v2 is a complete rewrite of the frontend package. The main changes are:

- **Vue 2 → Vue 3** (Composition API with `<script setup>`)
- **Options API mixins → Composables** (`useBaseForm`, `useBaseListing`, `useBaseAuth`)
- **jQuery → vanilla JS** (no jQuery dependency)
- **Webpack/Babel → Vite** (ESM + CJS output)
- **Bootstrap 4 / CoreUI 2 → Bootstrap 5 / CoreUI 5**
- **Trumbowyg → CKEditor 5 / Tiptap** (WYSIWYG editors)
- **Moment.js → dayjs + date-fns** (date formatting)
- **Vue components are now SFCs** (`.vue` files instead of `.js` mixins)

---

## Dependencies

### Removed

| Package | Replacement |
|---|---|
| `vue` ^2 | `vue` ^3.5 |
| `jquery` | Removed (vanilla JS) |
| `popper.js` | Removed (Bootstrap 5 has built-in Popper) |
| `bootstrap` ^4 | `bootstrap` ^5.3 |
| `@coreui/coreui` ^2 | `@coreui/coreui` ^5.3 |
| `@coreui/icons` | Removed |
| `font-awesome` ^4 | `@fortawesome/fontawesome-free` ^7.2 |
| `simple-line-icons` | Removed |
| `moment` / `moment-timezone` | `dayjs` ^1.11 + `date-fns` ^4.1 |
| `trumbowyg` / `vue-trumbowyg` | `ckeditor5` ^48 + `@tiptap/*` ^3.22 |
| `vee-validate` ^2 | `vee-validate` ^4.15 + `@vee-validate/rules` + `@vee-validate/i18n` |
| `vue-flatpickr-component` | `@vuepic/vue-datepicker` ^12.1 |
| `vue-notification` | `@kyvg/vue3-notification` ^3.4 |
| `vue-multiselect` ^2 | `vue-multiselect` ^3.2 |
| `vue2-dropzone` | `vue3-dropzone` ^2.2 |
| `v-tooltip` / `vue-js-modal` | `vue3-popper` ^1.5 |
| `vue-cookie` | `vue3-cookies` ^1.0 |
| `vue-quill-editor` | Removed (use CKEditor or Tiptap) |
| `vue-template-compiler` | Not needed in Vue 3 |
| `lodash` | Removed |

### Added

| Package | Purpose |
|---|---|
| `@tiptap/starter-kit` ^3.22, `@tiptap/vue-3` ^3.22, `@tiptap/extension-image` ^3.22, `@tiptap/extension-table` ^3.22 | Tiptap WYSIWYG editor (Link bundled in StarterKit; Table re-exports TableRow/TableCell/TableHeader) |
| `@ckeditor/ckeditor5-vue` ^7.4, `ckeditor5` ^48 | CKEditor 5 WYSIWYG editor |
| `vue3-popper` | Tooltips (replaces v-tooltip) |

### Build tools

| v1 | v2 |
|---|---|
| `@babel/preset-env`, `@babel/cli` | Removed |
| `sass-loader`, `vue-loader`, `resolve-url-loader` | Removed |
| `postcss-cli`, `autoprefixer` ^9, `cpx` | `autoprefixer` ^10 |
| — | `vite` ^8.0 + `@vitejs/plugin-vue` ^6.0 |

---

## Package entry point

v1 used a Babel-compiled `dist/index.js` (CJS). v2 uses Vite-built dual output:

```json
// v2 package.json
{
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./scss/*": "./scss/*"
  }
}
```

---

## Exports / API changes

### v1 exports (mixins and Options API objects)

```js
export { default as BaseForm } from './base-components/Form/BaseForm';
export { default as BaseUpload } from './base-components/Form/BaseUpload';
export { default as BaseListing } from './base-components/Listing/BaseListing';
export { default as Admin } from './admin/Admin';
export { default as Auth } from './auth/Form';
export { default as TranslationForm } from './translation/Form';
export { default as TranslationListing } from './translation/Listing';
```

### v2 exports (composables, components, utilities)

```js
// Composables
export { useBaseForm } from './composables/useBaseForm.js';
export { useBaseListing } from './composables/useBaseListing.js';
export { useBaseAuth } from './composables/useBaseAuth.js';
export { useAdmin } from './composables/useAdmin.js';
export { useResponsiveColumns } from './composables/useResponsiveColumns.js';

// Components — Form
export { default as FormInput } from './components/form/FormInput.vue';
export { default as FormEmail } from './components/form/FormEmail.vue';
// ... (all form, listing, auth, translation components)

// Utilities
export { formatDate, formatDatetime, formatTime, nowInTimezone } from './utils/dateFormatters.js';
export { getDateFnsLocale, initDateFnsLocale } from './utils/dateFnsLocale.js';
export { mediaCollectionProp, mediaCollectionDefaults } from './utils/mediaProps.js';
export { notifySuccess, notifyError } from './utils/notify.js';
export { initUI } from './ui/index.js';
```

---

## Migration guide for consuming projects

### 1. App entry point

**v1** — Vue 2 with Options API, global component registration via mixins:

```js
import { Admin } from '@brackets/craftable';
new Vue({ mixins: [Admin] }).$mount('#app');
```

**v2** — Vue 3 with `createApp`, composable-based setup:

```js
import { createApp } from 'vue';
import { useAdmin, initUI, initDateFnsLocale } from '@dejwcake/craftable';

const app = createApp({
    setup() {
        return useAdmin();
    },
});

// Register components globally
app.component('MyForm', MyForm);

initDateFnsLocale().then(() => {
    app.mount('#app');
    initUI();
});
```

### 2. Forms — mixin → composable

**v1** — extending BaseForm mixin:

```js
import { BaseForm } from '@brackets/craftable';

export default {
    mixins: [BaseForm],
    props: { /* ... */ },
    data() {
        return {
            form: { title: '', email: '' },
            mediaCollections: ['cover'],
        };
    },
    // Override methods as needed
};
```

**v2** — Vue 3 SFC with `useBaseForm` composable:

```vue
<script setup>
import { useBaseForm, mediaCollectionProp, mediaCollectionDefaults } from '@dejwcake/craftable';

const props = defineProps({
    action: { type: String, required: true },
    locales: { type: Array, default: () => [] },
    data: { type: Object, default: () => ({}) },
    cover: mediaCollectionProp,
});

const {
    form, errors, submitting, currentLocale,
    onSubmit, getPostData, getLocalizedFormDefaults,
    mediaCollections,
} = useBaseForm(props);

// Use getLocalizedFormDefaults() after composable is initialised to build
// locale-keyed sub-objects, e.g.: form.value.translations = getLocalizedFormDefaults();
mediaCollections.value = ['cover'];
</script>
```

### 3. Listings — mixin → composable

**v1** — extending BaseListing mixin:

```js
import { BaseListing } from '@brackets/craftable';

export default {
    mixins: [BaseListing],
    props: { /* ... */ },
    // Pagination, sorting, bulk ops all inherited from mixin
};
```

**v2** — Vue 3 SFC with `useBaseListing` composable:

```vue
<script setup>
import { useBaseListing } from '@dejwcake/craftable';

const props = defineProps({
    url: { type: String, required: true },
    data: { type: Object, default: null },
    translations: { type: Object, default: () => ({}) },
    // ...
});

const {
    pagination, orderBy, filters, search, collection, now,
    bulkItems, bulkCheckingAllLoader,
    isClickedAll, clickedBulkItemsCount,
    loadData, filter, resolveUrl, getAction,
    onBulkItemClicked, onBulkItemsClickedAll,
    onBulkItemsClickedAllWithPagination,
    onBulkItemsClickedAllUncheck,
    bulkDelete, confirmModal,
    onSort, onPageChange, onPerPageChange, onUpdateItem,
} = useBaseListing(props);
</script>
```

### 4. Auth forms

**v1** — extending Auth mixin:

```js
import { Auth } from '@brackets/craftable';
export default { mixins: [Auth] };
```

**v2** — pre-built Vue 3 SFC components:

```js
import {
    LoginForm,
    ForgotPasswordForm,
    ResetPasswordForm,
    ActivationForm,
    ActivationError,
} from '@dejwcake/craftable';

app.component('LoginForm', LoginForm);
```

### 5. Translations

**v1** — two components (TranslationListing mixin + TranslationForm mixin):

```js
import { TranslationListing, TranslationForm } from '@brackets/craftable';
```

**v2** — single `TranslationListing` SFC with inline editing via modals (no separate form):

```js
import { TranslationListing } from '@dejwcake/craftable';
app.component('TranslationListing', TranslationListing);
```

### 6. WYSIWYG editors

**v1** — Trumbowyg (jQuery-based), globally registered as `<wysiwyg>`:

```js
// Automatic via BaseForm mixin — Trumbowyg registered globally
```

**v2** — CKEditor 5 or Tiptap, used via form components:

```vue
<FormWysiwyg v-model="form.text" name="text" :errors="errors" />
<FormWysiwygSimple v-model="form.text" name="text" :errors="errors" />
```

- `FormWysiwyg` / `FormLocalizedWysiwyg` — CKEditor 5 (full-featured)
- `FormWysiwygSimple` / `FormLocalizedWysiwygSimple` — Tiptap (lightweight)

### 7. Date/time handling

**v1** — Moment.js with timezone, flatpickr date picker:

```js
import moment from 'moment';
moment().tz(this.timezone).format('YYYY-MM-DD HH:mm:ss');
```

**v2** — dayjs for formatting, date-fns for locales, VueDatePicker:

```js
import { formatDate, formatDatetime, formatTime, initDateFnsLocale } from '@dejwcake/craftable';
// Date picker component
import { VueDatePicker } from '@vuepic/vue-datepicker';
```

### 8. Notifications

**v1** — `vue-notification` (Vue 2):

```js
this.$notify({ type: 'success', title: '...', text: '...' });
```

**v2** — `@kyvg/vue3-notification` via utility functions:

```js
import { notifySuccess, notifyError } from '@dejwcake/craftable';
notifySuccess('Saved successfully');
```

### 9. UI initialization

**v1** — jQuery + CoreUI 2 + Bootstrap 4 JS (auto-initialized):

```js
import 'popper.js';
import 'bootstrap';
import '@coreui/coreui';
// jQuery-based sidebar, dropdowns, etc.
```

**v2** — vanilla JS `initUI()` (call after Vue mounts):

```js
import { initUI, initDateFnsLocale } from '@dejwcake/craftable';
initDateFnsLocale().then(() => {
    app.mount('#app');
    initUI();
});
```

Handles: sidebar toggle (mobile + desktop unfoldable), dropdowns, spinner buttons, empty nav title cleanup.

### 10. Validation

**v1** — vee-validate v2 (directive-based):

```html
<input v-validate="'required|email'" name="email" />
```

**v2** — vee-validate v4 (composable-based, integrated in `useBaseForm`):

```vue
<FormEmail v-model="form.email" name="email" :errors="errors" />
```

Rules are registered globally in the project's `bootstrap.js`:

```js
import { defineRule, configure } from 'vee-validate';
import * as rules from '@vee-validate/rules';
Object.entries(rules).forEach(([name, rule]) => {
    if (typeof rule === 'function') defineRule(name, rule);
});
```

---

## SCSS changes

### Vendor imports

```scss
// v1
@import '~@coreui/icons/css/coreui-icons.min.css';
@import '~font-awesome/scss/font-awesome.scss';
@import '~simple-line-icons/scss/simple-line-icons.scss';
@import "~@coreui/coreui/scss/coreui";

// v2
@import '@fortawesome/fontawesome-free/css/fontawesome.css';
@import '@fortawesome/fontawesome-free/css/solid.css';
@import '@fortawesome/fontawesome-free/css/regular.css';
@import "@coreui/coreui/scss/coreui";
@import 'vue-multiselect/dist/vue-multiselect.css';
```

Note: The `~` prefix (webpack sass-loader convention) is no longer used with Vite.

### Bootstrap 4 → 5 class changes in templates

| BS4 | BS5 |
|---|---|
| `dropdown-menu-right` | `dropdown-menu-end` |
| `dropdown-menu-left` | `dropdown-menu-start` |
| `float-right` | `float-end` |
| `float-left` | `float-start` |
| `mr-*` / `ml-*` | `me-*` / `ms-*` |
| `pr-*` / `pl-*` | `pe-*` / `ps-*` |
| `text-right` | `text-end` |
| `text-left` | `text-start` |
| `badge-*` | `bg-*` |
| `btn-outline-secondary` | `btn-outline-secondary` (unchanged) |
| `custom-control` | `form-check` |
| `data-toggle` | `data-bs-toggle` or `data-coreui-toggle` |
| `data-dismiss` | `data-bs-dismiss` or `data-coreui-dismiss` |
| `form-group` | `mb-3` (form-group removed) |
| `form-row` | `row g-3` |
| `input-group-append/prepend` | Removed (direct children) |

### Icon classes

| v1 (Font Awesome 4) | v2 (Font Awesome 7 Free) |
|---|---|
| `fa fa-*` | `fa-solid fa-*` or `fa fa-*` (solid is default) |
| `icon-*` (Simple Line Icons) | Use `fa-*` equivalents |

---

## Build system

### v1 — Babel + PostCSS

```json
{
  "scripts": {
    "build": "babel src -d dist && postcss scss/admin.scss -o dist/admin.css"
  }
}
```

### v2 — Vite

```json
{
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch"
  }
}
```

The consuming project also switches from `webpack.mix.js` (Laravel Mix) to `vite.config.js` (Laravel Vite Plugin).

---

## Publish components script

v2 adds `scripts/publish-components.js` — a Node.js CLI tool that copies `.vue` component files from the package into the consuming project for customization. Components are resolved via the `craftableOverrides()` Vite plugin, which checks the project directory first, then falls back to the package.

---

## Bulk delete payload

v2 changes the `bulkDelete` POST payload — the `data` wrapper has been removed:

```js
// v1
axios.post(url, { data: { ids: [...] } });

// v2
axios.post(url, { ids: [...] });
```

Backend `bulkDestroy` controllers must be updated to read `ids` directly from the request instead of from `$request->data['ids']`:

```php
// Before
(new Collection($request->data['ids']))->chunk(1000)->each(...);

// After — access ids directly from the request
(new Collection($request->ids))->chunk(1000)->each(...);
```

---

## Responsive columns

v2 introduces `useResponsiveColumns` composable for responsive table column visibility. It uses `ResizeObserver` on the card body container to determine how many columns fit:

```vue
<script setup>
import { ref } from 'vue';
import { useResponsiveColumns } from '@dejwcake/craftable';

const cardBody = ref(null);
const { isColumnVisible } = useResponsiveColumns(cardBody);
</script>

<template>
    <div class="card-body" ref="cardBody">
        <Sortable v-if="isColumnVisible(4)" :column="'created_at'" ...>
```
