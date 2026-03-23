import { describe, it, expect } from 'vitest';
import { propagateImageWidths, deepMerge } from '@/utils/ckeditorHelpers.js';

describe('propagateImageWidths', () => {
    it('copies figure width to child img', () => {
        const html = '<figure style="width: 300px;"><img src="test.jpg"></figure>';
        const result = propagateImageWidths(html);
        expect(result).toContain('width: 300px');
        expect(result).toContain('height: auto');
    });

    it('returns unchanged html when no figures have width', () => {
        const html = '<p>Hello world</p>';
        expect(propagateImageWidths(html)).toBe(html);
    });

    it('returns falsy input as-is', () => {
        expect(propagateImageWidths('')).toBe('');
        expect(propagateImageWidths(null)).toBe(null);
        expect(propagateImageWidths(undefined)).toBe(undefined);
    });

    it('skips figures without img children', () => {
        const html = '<figure style="width: 200px;"><div>no img</div></figure>';
        expect(propagateImageWidths(html)).toBe(html);
    });
});

describe('deepMerge', () => {
    it('merges flat objects', () => {
        expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
    });

    it('merges nested objects recursively', () => {
        const target = { a: { x: 1, y: 2 } };
        const source = { a: { y: 3, z: 4 } };
        expect(deepMerge(target, source)).toEqual({ a: { x: 1, y: 3, z: 4 } });
    });

    it('arrays in source override target (no recursive array merge)', () => {
        const target = { items: [1, 2] };
        const source = { items: [3] };
        expect(deepMerge(target, source)).toEqual({ items: [3] });
    });
});
