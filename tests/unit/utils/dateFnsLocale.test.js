import { describe, it, expect, beforeEach } from 'vitest';
import { getDateFnsLocale, initDateFnsLocale } from '@/utils/dateFnsLocale.js';

describe('initDateFnsLocale', () => {
    beforeEach(() => {
        document.documentElement.lang = 'en';
    });

    it('defaults to enUS locale', () => {
        const locale = getDateFnsLocale();
        expect(locale.code).toBe('en-US');
    });

    it.each([
        ['sk', 'sk'],
        ['cs', 'cs'],
        ['en', 'en-US'],
        ['de', 'de'],
        ['fr', 'fr'],
        ['es', 'es'],
        ['pl', 'pl'],
        ['hu', 'hu'],
    ])('resolves lang="%s" to locale code "%s"', async (lang, expectedCode) => {
        document.documentElement.lang = lang;
        await initDateFnsLocale();
        expect(getDateFnsLocale().code).toBe(expectedCode);
    });

    it('falls back to enUS for unknown language', async () => {
        document.documentElement.lang = 'xx';
        await initDateFnsLocale();
        expect(getDateFnsLocale().code).toBe('en-US');
    });

    it('falls back to enUS for empty lang', async () => {
        document.documentElement.lang = '';
        await initDateFnsLocale();
        expect(getDateFnsLocale().code).toBe('en-US');
    });
});
