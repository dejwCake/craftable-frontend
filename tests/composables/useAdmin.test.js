import { describe, it, expect, afterEach } from 'vitest';
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
});
