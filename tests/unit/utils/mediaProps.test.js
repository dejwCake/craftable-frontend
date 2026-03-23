import { describe, it, expect } from 'vitest';
import { mediaCollectionDefaults, mediaCollectionProp } from '@/utils/mediaProps.js';

describe('mediaCollectionDefaults', () => {
    it('has expected shape and default values', () => {
        expect(mediaCollectionDefaults).toEqual({
            url: '',
            collection: '',
            maxNumberOfFiles: 1,
            maxFileSizeInMb: 2,
            acceptedFileTypes: undefined,
            thumbnailWidth: 200,
            uploadedMedia: [],
        });
    });
});

describe('mediaCollectionProp', () => {
    it('default() returns a fresh copy each call', () => {
        const a = mediaCollectionProp.default();
        const b = mediaCollectionProp.default();
        expect(a).toEqual(b);
        expect(a).not.toBe(b);
    });
});
