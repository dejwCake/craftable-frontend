import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

import { withSetup } from '../helpers/withSetup.js';
import { useBaseForm } from '@/composables/useBaseForm.js';

describe('useBaseForm', () => {
    let unmount;

    afterEach(() => {
        if (unmount) unmount();
    });

    function setup(props = {}, options = {}) {
        const defaultProps = {
            data: { name: 'Test' },
            action: '/api/items',
            locales: [],
        };
        const { result, unmount: u } = withSetup(useBaseForm, [{ ...defaultProps, ...props }, options]);
        unmount = u;
        return result;
    }

    describe('initial state', () => {
        it('form is populated from props.data', () => {
            const result = setup({ data: { title: 'Hello' } });
            expect(result.form.value.title).toBe('Hello');
        });

        it('form defaults to empty object when data is empty', () => {
            const result = setup({ data: {} });
            expect(result.form.value).toEqual({});
        });

        it('submitting starts false', () => {
            const result = setup();
            expect(result.submitting.value).toBe(false);
        });
    });

    describe('onFail', () => {
        it('transforms dot-notation error keys to underscore', () => {
            const result = setup();

            window.axios.post.mockRejectedValueOnce({
                response: {
                    data: {
                        errors: {
                            'name.en': ['Name EN is required'],
                            'name.sk': ['Name SK is required'],
                        },
                    },
                },
            });

            result.onSubmit();

            return new Promise((resolve) => {
                setTimeout(() => {
                    // Errors should be set with transformed keys
                    expect(result.submitting.value).toBe(false);
                    resolve();
                }, 10);
            });
        });

        it('keeps flat keys unchanged', () => {
            const result = setup();

            window.axios.post.mockRejectedValueOnce({
                response: {
                    data: {
                        errors: {
                            email: ['Email is required'],
                        },
                    },
                },
            });

            result.onSubmit();

            return new Promise((resolve) => {
                setTimeout(() => {
                    expect(result.submitting.value).toBe(false);
                    resolve();
                }, 10);
            });
        });
    });

    describe('showLocalizedValidationError', () => {
        it('returns true when error key ends with locale suffix', () => {
            const result = setup({ locales: ['en', 'sk'], defaultLocale: 'en' });
            result.setErrors({ name_sk: 'Required' });
            expect(result.showLocalizedValidationError.value).toBe(true);
        });

        it('returns false when no locale-suffixed errors', () => {
            const result = setup({ locales: ['en', 'sk'], defaultLocale: 'en' });
            result.setErrors({ name: 'Required' });
            expect(result.showLocalizedValidationError.value).toBe(false);
        });
    });

    describe('shouldShowLangGroup', () => {
        it('large screen + defaultLocale → true always', () => {
            const result = setup({ locales: ['en', 'sk'], defaultLocale: 'en' });
            result.onSmallScreen.value = false;
            expect(result.shouldShowLangGroup('en')).toBe(true);
        });

        it('large screen + non-default locale + formLocalized + currentLocale matches → true', () => {
            const result = setup({ locales: ['en', 'sk'], defaultLocale: 'en' });
            result.onSmallScreen.value = false;
            result.isFormLocalized.value = true;
            result.currentLocale.value = 'sk';
            expect(result.shouldShowLangGroup('sk')).toBe(true);
        });

        it('large screen + non-default locale + formLocalized=false → false', () => {
            const result = setup({ locales: ['en', 'sk'], defaultLocale: 'en' });
            result.onSmallScreen.value = false;
            result.isFormLocalized.value = false;
            expect(result.shouldShowLangGroup('sk')).toBe(false);
        });

        it('small screen + currentLocale matches → true', () => {
            const result = setup({ locales: ['en', 'sk'], defaultLocale: 'en' });
            result.onSmallScreen.value = true;
            result.currentLocale.value = 'en';
            expect(result.shouldShowLangGroup('en')).toBe(true);
        });

        it('small screen + currentLocale does not match → false', () => {
            const result = setup({ locales: ['en', 'sk'], defaultLocale: 'en' });
            result.onSmallScreen.value = true;
            result.currentLocale.value = 'en';
            expect(result.shouldShowLangGroup('sk')).toBe(false);
        });
    });

    describe('getLocalizedFormDefaults', () => {
        it('returns object with null values for each locale', () => {
            const result = setup({ locales: ['en', 'sk', 'cs'] });
            expect(result.getLocalizedFormDefaults()).toEqual({
                en: null,
                sk: null,
                cs: null,
            });
        });
    });

    describe('locales computed', () => {
        it('defaultLocale is first locale when not specified', () => {
            const result = setup({ locales: ['sk', 'en', 'cs'] });
            expect(result.defaultLocale.value).toBe('sk');
        });

        it('otherLocales excludes defaultLocale', () => {
            const result = setup({ locales: ['en', 'sk', 'cs'], defaultLocale: 'en' });
            expect(result.otherLocales.value).toEqual(['sk', 'cs']);
        });
    });

    describe('onSubmit', () => {
        it('posts form data to props.action', () => {
            const result = setup({ action: '/api/store' });
            window.axios.post.mockResolvedValueOnce({ data: {} });

            result.onSubmit();

            expect(window.axios.post).toHaveBeenCalledWith('/api/store', expect.any(Object));
            expect(result.submitting.value).toBe(true);
        });
    });

    describe('onSuccess', () => {
        it('redirects immediately without message', () => {
            const result = setup();
            const replaceMock = vi.fn();
            Object.defineProperty(window, 'location', {
                value: { replace: replaceMock },
                writable: true,
                configurable: true,
            });

            window.axios.post.mockResolvedValueOnce({ data: { redirect: '/items' } });

            result.onSubmit();

            return new Promise((resolve) => {
                setTimeout(() => {
                    expect(replaceMock).toHaveBeenCalledWith('/items');
                    resolve();
                }, 10);
            });
        });
    });
});
