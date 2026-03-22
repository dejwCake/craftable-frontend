#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(__dirname, '../src');
const componentsDir = resolve(srcDir, 'components');

const groups = {
    auth: {
        src: resolve(srcDir, 'auth'),
        dest: 'resources/js/admin/auth',
        ext: '.vue',
    },
    form: {
        src: resolve(componentsDir, 'form'),
        dest: 'resources/js/admin/components/form',
        ext: '.vue',
    },
    listing: {
        src: resolve(componentsDir, 'listing'),
        dest: 'resources/js/admin/components/listing',
        ext: '.vue',
    },
    components: {
        src: componentsDir,
        dest: 'resources/js/admin/components',
        ext: '.vue',
        topLevelOnly: true,
    },
    translation: {
        src: resolve(srcDir, 'translation'),
        dest: 'resources/js/admin/translation',
        ext: '.vue',
        recursive: true,
    },
    composables: {
        src: resolve(srcDir, 'composables'),
        dest: 'resources/js/admin/composables',
        ext: '.js',
    },
    utils: {
        src: resolve(srcDir, 'utils'),
        dest: 'resources/js/admin/utils',
        ext: '.js',
    },
    ui: {
        src: resolve(srcDir, 'ui'),
        dest: 'resources/js/admin/ui',
        ext: '.js',
    },
};

function collectFiles(dir, ext, recursive = false, basePath = '') {
    const entries = readdirSync(dir);
    let files = [];

    for (const entry of entries) {
        const fullPath = join(dir, entry);
        const relativePath = basePath ? join(basePath, entry) : entry;

        if (recursive && statSync(fullPath).isDirectory()) {
            files = files.concat(collectFiles(fullPath, ext, true, relativePath));
        } else if (entry.endsWith(ext)) {
            files.push(relativePath);
        }
    }

    return files;
}

const arg = process.argv[2];

if (arg && arg !== 'all' && !groups[arg]) {
    console.error(`Unknown group: ${arg}`);
    console.error(`Usage: craftable-publish-components [${Object.keys(groups).join('|')}|all]`);
    process.exit(1);
}

const selectedGroups = (!arg || arg === 'all')
    ? Object.keys(groups)
    : [arg];

let totalPublished = 0;
let totalSkipped = 0;

for (const groupName of selectedGroups) {
    const group = groups[groupName];

    if (!existsSync(group.src)) continue;

    const files = collectFiles(group.src, group.ext, group.recursive || false);

    if (files.length === 0) continue;

    console.log(`\n[${groupName}]`);
    const destDir = resolve(process.cwd(), group.dest);
    mkdirSync(destDir, { recursive: true });

    for (const file of files) {
        const dest = resolve(destDir, file);
        if (existsSync(dest)) {
            console.log(`  SKIP  ${file} (already exists)`);
            totalSkipped++;
        } else {
            mkdirSync(dirname(dest), { recursive: true });
            cpSync(resolve(group.src, file), dest);
            console.log(`  COPY  ${file}`);
            totalPublished++;
        }
    }

    console.log(`  -> ${group.dest}/`);
}

console.log(`\nDone: ${totalPublished} published, ${totalSkipped} skipped.`);
