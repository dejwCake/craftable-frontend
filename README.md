# Craftable frontend
This is a frontend dependency of [Craftable](https://github.com/BRACKETS-by-TRIAD/craftable). Craftable is a Laravel-based open-source toolkit for building administration interfaces.

![Craftable administration area example](https://www.getcraftable.com/docs/5.0/images/posts-crud.png)

This package is part of [Craftable](https://github.com/dejwCake/craftable) (`dejwCake/craftable`), an administration starter kit for Laravel 12, forked from [Craftable](https://github.com/BRACKETS-by-TRIAD/craftable) (`brackets/craftable`).

## Documentation
You can find the full documentation at https://www.getcraftable.com/

## Issues
Where do I report issues?
If something is not working as expected, please open an issue in the main repository https://github.com/dejwCake/craftable.

## Publishing to npm

Follow these steps to publish a new version of the package to npm:

1. **Prerequisites**  
   - Ensure you have an npm account and are added as a collaborator/owner of the package.  
   - Log in from your terminal: `npm login`.

2. **Check and bump the version**  
   - Inspect the current version in `package.json`.  
   - Bump it according to [semver](https://semver.org/) using one of:  
     - `npm version patch`  
     - `npm version minor`  
     - `npm version major`  

3. **Build**
   - Build the package:  
     - `npm run build`  

4. **Dry-run the publish**  
   - Verify what would be published without actually publishing:  
     - `npm publish --dry-run`  

5. **Publish the package**  
   - When everything looks correct, publish to npm:  
     - `npm publish`  
   - For scoped packages you want public:
     - `npm publish --access public`
