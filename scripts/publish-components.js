#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const componentsDir = resolve(__dirname, '../src/components');

const groups = {
    auth: {
        src: resolve(componentsDir, 'auth'),
        dest: 'resources/js/admin/components/auth',
    },
    form: {
        src: resolve(componentsDir, 'form'),
        dest: 'resources/js/admin/components/form',
    },
};

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
    const destDir = resolve(process.cwd(), group.dest);
    const files = readdirSync(group.src).filter(f => f.endsWith('.vue'));

    if (files.length === 0) continue;

    console.log(`\n[${groupName}]`);
    mkdirSync(destDir, { recursive: true });

    for (const file of files) {
        const dest = resolve(destDir, file);
        if (existsSync(dest)) {
            console.log(`  SKIP  ${file} (already exists)`);
            totalSkipped++;
        } else {
            cpSync(resolve(group.src, file), dest);
            console.log(`  COPY  ${file}`);
            totalPublished++;
        }
    }

    console.log(`  -> ${group.dest}/`);
}

console.log(`\nDone: ${totalPublished} published, ${totalSkipped} skipped.`);
