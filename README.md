# Craftable frontend
This is a frontend dependency of [Craftable](https://github.com/BRACKETS-by-TRIAD/craftable). Craftable is a Laravel-based open-source toolkit for building administration interfaces.

![Craftable administration area example](https://www.getcraftable.com/docs/5.0/images/posts-crud.png)

This package is part of [Craftable](https://github.com/dejwCake/craftable) (`dejwCake/craftable`), an administration starter kit for Laravel 12, forked from [Craftable](https://github.com/BRACKETS-by-TRIAD/craftable) (`brackets/craftable`).

## Documentation
You can find the full documentation at https://www.getcraftable.com/

## Issues
Where do I report issues?
If something is not working as expected, please open an issue in the main repository https://github.com/dejwCake/craftable.

## Commands

All commands run inside Docker containers from the package directory.

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

### Check Prettier formatting
```shell
docker compose run -it --rm node npm run format:check
```

### Fix Prettier formatting
```shell
docker compose run -it --rm node npm run format
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

4**Build**
   - Build the package:  
```shell
npm run build
```

5**Dry-run the publish**  
   - Verify what would be published without actually publishing:  
```shell
npm publish --dry-run
```

6**Publish the package**  
   - When everything looks correct, publish to npm:  
```shell
npm publish
```
   - For scoped packages you want public:
```shell
npm publish --access public
```
