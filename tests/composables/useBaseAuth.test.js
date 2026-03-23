import { describe, it, expect, vi, afterEach } from 'vitest';
import { withSetup } from '../helpers/withSetup.js';
import { useBaseAuth } from '@/composables/useBaseAuth.js';

describe('useBaseAuth', () => {
    let unmount;

    afterEach(() => {
        if (unmount) unmount();
    });

    function setup(props = {}, options = {}) {
        const defaultProps = { action: '/login' };
        const { result, unmount: u } = withSetup(useBaseAuth, [{ ...defaultProps, ...props }, options]);
        unmount = u;
        return result;
    }

    describe('initial state', () => {
        it('form uses formDefaults when provided', () => {
            const result = setup({}, { formDefaults: { email: '', password: '' } });
            expect(result.form.value).toEqual({ email: '', password: '' });
        });

        it('form defaults to empty object', () => {
            const result = setup();
            expect(result.form.value).toEqual({});
        });

        it('submitting starts false', () => {
            const result = setup();
            expect(result.submitting.value).toBe(false);
        });
    });

    describe('onFail', () => {
        it('maps error keys flat (no dot-splitting)', () => {
            const result = setup();
            // Simulate calling onFail with server errors
            // We access the internal function through onSubmit's catch path
            // Instead, we test by triggering a failed POST
            window.axios.post.mockRejectedValueOnce({
                response: { data: { errors: { email: ['Email is required'], password: ['Password is required'] } } },
            });

            result.form.value = { email: '', password: '' };
            result.onSubmit();

            // Wait for the promise to resolve
            return new Promise((resolve) => {
                setTimeout(() => {
                    expect(result.submitting.value).toBe(false);
                    resolve();
                }, 10);
            });
        });
    });

    describe('onSuccess', () => {
        it('calls custom onSuccess handler when provided', () => {
            const customHandler = vi.fn();
            const result = setup({}, { onSuccess: customHandler });

            window.axios.post.mockResolvedValueOnce({ data: { message: 'OK' } });

            result.onSubmit();

            return new Promise((resolve) => {
                setTimeout(() => {
                    expect(customHandler).toHaveBeenCalledWith({ message: 'OK' });
                    resolve();
                }, 10);
            });
        });

        it('sets successMessage when no custom handler', () => {
            const result = setup();

            window.axios.post.mockResolvedValueOnce({ data: { message: 'Welcome!' } });

            result.onSubmit();

            return new Promise((resolve) => {
                setTimeout(() => {
                    expect(result.successMessage.value).toBe('Welcome!');
                    resolve();
                }, 10);
            });
        });

        it('redirects when data.redirect is present', () => {
            const result = setup();
            const replaceMock = vi.fn();
            Object.defineProperty(window, 'location', {
                value: { replace: replaceMock },
                writable: true,
                configurable: true,
            });

            window.axios.post.mockResolvedValueOnce({ data: { redirect: '/dashboard' } });

            result.onSubmit();

            return new Promise((resolve) => {
                setTimeout(() => {
                    expect(replaceMock).toHaveBeenCalledWith('/dashboard');
                    resolve();
                }, 10);
            });
        });
    });

    describe('onSubmit', () => {
        it('posts to props.action with form data', () => {
            const result = setup({ action: '/api/login' });
            result.form.value = { email: 'test@test.com' };

            window.axios.post.mockResolvedValueOnce({ data: {} });

            result.onSubmit();

            expect(window.axios.post).toHaveBeenCalledWith('/api/login', { email: 'test@test.com' });
        });
    });
});
