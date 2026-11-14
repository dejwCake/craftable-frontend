# Craftable frontend
This is a frontend dependency of [Craftable](https://github.com/BRACKETS-by-TRIAD/craftable). Craftable is a Laravel-based open-source toolkit for building administration interfaces.

![Craftable administration area example](https://www.getcraftable.com/docs/5.0/images/posts-crud.png)

This package is part of [Craftable](https://github.com/dejwCake/craftable) (`dejwCake/craftable`), an administration starter kit for Laravel 12, forked from [Craftable](https://github.com/BRACKETS-by-TRIAD/craftable) (`brackets/craftable`).

## Documentation
You can find the full documentation at https://www.getcraftable.com/

## Issues
Where do I report issues?
If something is not working as expected, please open an issue in the main repository https://github.com/dejwCake/craftable.

## Components

Everything public is exported from `src/index.js`. The groups under `src/` are:

- `composables/` — `useBaseForm`, `useBaseAuth`, `useBaseListing`, `useAdmin`, `useResponsiveColumns`
- `components/form/`, `components/listing/`, `components/show/` — form fields, listing parts, show rows
- `auth/` — `LoginForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `ActivationForm`, `ActivationError`,
  `TwoFactorChallengeForm` (the code asked for after the password login)
- `account/` — `ProfileForm`, `PasswordChangeForm`, `TwoFactorSettings`: the logged-in admin's own
  pages (admin-auth profile, password and two-factor authentication)
- `translation/` — `TranslationListing`

### Overriding a component

Projects import components by path, e.g. `import ProfileForm from '@craftable/account/ProfileForm.vue'`.
The `craftableOverrides()` Vite plugin (in the admin-ui install stub of `vite.config.js`) resolves
`@craftable/<path>` to `resources/js/admin/<path>` when that file exists, otherwise to this package's
`src/<path>`. To customise a component, copy it to the same path in the project — by hand or with
`npx craftable-publish-components <group>` (`account`, `auth`, `form`, `listing`, …) — and edit the
copy. Package components import shared code only from `@dejwcake/craftable` or `@craftable/…`, so a
copy builds unchanged. An overridden copy no longer receives package fixes.

Projects without `craftableOverrides()` override by registering their own component under the same
name in `admin.js`.

## Commands

All commands run inside Docker containers from the package directory. Vitest tests live under `tests/`;
snapshots live in `tests/components/__snapshots__/`.

### Install dependencies
```shell
docker compose run -it --rm node npm install
```

### Build the package
```shell
docker compose run -it --rm node npm run build
```

### Run ESLint
```shell
docker compose run -it --rm node npm run lint
```

### Run ESLint with auto-fix
```shell
docker compose run -it --rm node npm run lint:fix
```

### Run Stylelint on SCSS
```shell
docker compose run -it --rm node npm run lint:style
```

### Run Stylelint with auto-fix
```shell
docker compose run -it --rm node npm run lint:style:fix
```

### Check Prettier formatting
```shell
docker compose run -it --rm node npm run format:check
```

### Fix Prettier formatting
```shell
docker compose run -it --rm node npm run format
```

### Run tests
```shell
docker compose run -it --rm node npm test
```

### Run tests in watch mode
```shell
docker compose run -it --rm node npm run test:watch
```

### Run tests with coverage
```shell
docker compose run -it --rm node npm run test:coverage
```

### Update snapshots after an intentional markup change
```shell
docker compose run -it --rm node npm test -- -u
```

### Run the whole frontend suite

Run every check and the test suite in sequence (stops at the first failure):
```shell
docker compose run -it --rm node npm ci \
  && docker compose run -it --rm node npm run build \
  && docker compose run -it --rm node npm run lint \
  && docker compose run -it --rm node npm run lint:style \
  && docker compose run -it --rm node npm run format:check \
  && docker compose run -it --rm node npm test
```

## Publishing to npm

Follow these steps to publish a new version of the package to npm:

```shell
docker compose run -it --rm node bash
```

1. **Prerequisites**  
   - Ensure you have an npm account and are added as a collaborator/owner of the package.  
   - Log in from your terminal: 
```shell
npm login
```

2. **Check and bump the version**  
   - Inspect the current version in `package.json`.  
   - Bump it according to [semver](https://semver.org/) using one of:  
```shell
npm version patch
npm version minor
npm version major
```

3. **Install**
    - Install dependencies:
```shell
npm install
```

4. **Build**
   - Build the package:  
```shell
npm run build
```

5. **Dry-run the publish**  
   - Verify what would be published without actually publishing:  
```shell
npm publish --dry-run
```

6. **Publish the package**  
   - When everything looks correct, publish to npm:  
```shell
npm publish
```
   - For scoped packages you want public:
```shell
npm publish --access public
```
