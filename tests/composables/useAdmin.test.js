import { describe, it, expect, afterEach, vi } from 'vitest';
import { withSetup } from '../helpers/withSetup.js';
import { useAdmin } from '@/composables/useAdmin.js';

describe('useAdmin', () => {
    let unmount;

    afterEach(() => {
        if (unmount) unmount();
    });

    it('loading starts as false', () => {
        const { result, unmount: u } = withSetup(useAdmin);
        unmount = u;
        expect(result.loading.value).toBe(false);
    });

    it('registers request interceptor after mount', () => {
        const { unmount: u } = withSetup(useAdmin);
        unmount = u;
        expect(window.axios.interceptors.request.use).toHaveBeenCalledOnce();
    });

    it('registers response interceptor after mount', () => {
        const { unmount: u } = withSetup(useAdmin);
        unmount = u;
        expect(window.axios.interceptors.response.use).toHaveBeenCalledOnce();
    });

    describe('response error interceptor', () => {
        function errorInterceptor() {
            const { unmount: u } = withSetup(useAdmin);
            unmount = u;
            return window.axios.interceptors.response.use.mock.calls[0][1];
        }

        it('follows the redirect from a 403 JSON body', async () => {
            const assign = vi.spyOn(window.location, 'assign').mockImplementation(() => {});
            const error = { response: { status: 403, data: { redirect: '/admin/two-factor/challenge' } } };

            await expect(errorInterceptor()(error)).rejects.toBe(error);
            expect(assign).toHaveBeenCalledWith('/admin/two-factor/challenge');
            assign.mockRestore();
        });

        it('does not redirect on a 403 without a redirect', async () => {
            const assign = vi.spyOn(window.location, 'assign').mockImplementation(() => {});
            const error = { response: { status: 403, data: { message: 'Forbidden' } } };

            await expect(errorInterceptor()(error)).rejects.toBe(error);
            expect(assign).not.toHaveBeenCalled();
            assign.mockRestore();
        });

        it('does not redirect on other statuses', async () => {
            const assign = vi.spyOn(window.location, 'assign').mockImplementation(() => {});
            const error = { response: { status: 422, data: { redirect: '/elsewhere' } } };

            await expect(errorInterceptor()(error)).rejects.toBe(error);
            expect(assign).not.toHaveBeenCalled();
            assign.mockRestore();
        });
    });
});
