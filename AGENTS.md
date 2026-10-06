# AGENTS.md — @dejwcake/craftable (craftable-frontend)

Vue 3 component and composable library for Craftable admin panels, published to npm as
`@dejwcake/craftable` (fork of the `brackets/craftable` frontend). Shipped as compiled ESM/CJS
(`dist/`) plus SCSS and source. Consumed by Laravel projects through the `admin-ui` install stubs.

## Layout

- `src/index.js` — the public API. Anything exported here is consumed by projects; renaming or
  removing an export is a breaking change.
- `src/composables/` — `useBaseForm`, `useBaseAuth`, `useBaseListing`, `useAdmin`,
  `useResponsiveColumns`.
- `src/components/form/` — form fields (incl. localized variants, `MediaUpload`, `TiptapEditor`,
  `CkeditorEditor`); `src/components/listing/` — pagination, sorting, search, bulk operations,
  row actions; `src/components/` — shared across listing/form/show:
  `ConfirmModal`, `UserDetailTooltip`, `ReadOnlySwitch`; `src/components/show/` — `ShowRow`.
- `src/auth/` — login, password reset and activation forms (built on `useBaseAuth`).
- `src/translation/` — `TranslationListing` with edit/import/export modals.
- `src/ui/` — Bootstrap 5 / CoreUI 5 initialization; `src/utils/` — dates (dayjs, date-fns),
  notifications, media prop helpers, CKEditor helpers.
- `scss/` — variables, vendor imports (CoreUI 5, Font Awesome), styles.
- `tests/` — Vitest; component snapshots in `tests/components/__snapshots__/`.

## Commands

Every npm command runs in the `node` container from the package root — never a host `npm`.
The full list (lint, stylelint, prettier, coverage, the "whole frontend suite" one-liner and
npm publishing) is in **README.md → "Commands"**. The ones you need most:

```shell
docker compose run --rm node npm install
docker compose run --rm node npm run build
docker compose run --rm node npm test
docker compose run --rm node npm test -- -u          # update snapshots after an intended markup change
docker compose run --rm node npm run lint            # lint:fix to auto-fix
docker compose run --rm node npm run lint:style      # stylelint on scss/
docker compose run --rm node npm run format:check    # format to fix
```

A change is done when build, lint, lint:style, format:check and the tests are green.

## Conventions

- Vue 3 Composition API with `<script setup>` everywhere; logic lives in composables.
- Markup is Bootstrap 5 / CoreUI 5 — no Bootstrap 4 / CoreUI 2 classes.
- Formatting is owned by Prettier, linting by ESLint and Stylelint — don't hand-format against them.
- New public components/composables must be exported from `src/index.js` and covered by a
  Vitest test; snapshot changes must be reviewed, not blindly updated.
- `dist/` is gitignored — never commit build output.

## Tiptap v3 (relevant to `TiptapEditor.vue`)

- Link is bundled in StarterKit: configure it with `StarterKit.configure({ link: { ... } })`.
  Don't add `@tiptap/extension-link` back.
- `Table`, `TableRow`, `TableCell`, `TableHeader` are all named exports of
  `@tiptap/extension-table`; the standalone row/cell/header packages are gone.
- `setContent(content, options)` — pass `{ emitUpdate: false }`, not a bare `false`.

## Using a local build in the Craftable project

The project under development consumes this package from `packages/craftable-frontend`.
After building here, rebuild the consuming project too (its `npm install` + `npm run build`),
otherwise it keeps serving the previous bundle.

## Versioning

The package is on **2.x**; bump with `npm version` only as part of a release (see README.md →
"Publishing to npm"). Consumer-facing changes go to `UPGRADE.md` when consumers have to act.
