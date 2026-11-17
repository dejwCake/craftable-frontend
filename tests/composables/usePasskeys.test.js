import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@simplewebauthn/browser', () => ({
    browserSupportsWebAuthn: vi.fn(() => true),
    browserSupportsWebAuthnAutofill: vi.fn(() => Promise.resolve(true)),
    startRegistration: vi.fn(() => Promise.resolve({ id: 'registration' })),
    startAuthentication: vi.fn(() => Promise.resolve({ id: 'assertion' })),
    WebAuthnAbortService: { cancelCeremony: vi.fn() },
}));

import {
    browserSupportsWebAuthn,
    browserSupportsWebAuthnAutofill,
    startAuthentication,
    startRegistration,
    WebAuthnAbortService,
} from '@simplewebauthn/browser';
import { usePasskeys } from '@/composables/usePasskeys.js';

const options = { challenge: 'abc', rpId: 'localhost' };

describe('usePasskeys', () => {
    let secureContext;
    let userAgent;

    beforeEach(() => {
        secureContext = Object.getOwnPropertyDescriptor(window, 'isSecureContext');
        userAgent = Object.getOwnPropertyDescriptor(window.navigator, 'userAgent');
        Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
        browserSupportsWebAuthn.mockReturnValue(true);
        browserSupportsWebAuthnAutofill.mockResolvedValue(true);
        window.axios.post.mockResolvedValue({ data: options });
    });

    afterEach(() => {
        if (secureContext) {
            Object.defineProperty(window, 'isSecureContext', secureContext);
        } else {
            delete window.isSecureContext;
        }
        if (userAgent) {
            Object.defineProperty(window.navigator, 'userAgent', userAgent);
        }
    });

    function setUserAgent(value) {
        Object.defineProperty(window.navigator, 'userAgent', { value, configurable: true });
    }

    describe('isSupported', () => {
        it('is true with WebAuthn in a secure context', () => {
            expect(usePasskeys().isSupported()).toBe(true);
        });

        it('is false without WebAuthn', () => {
            browserSupportsWebAuthn.mockReturnValue(false);
            expect(usePasskeys().isSupported()).toBe(false);
        });

        it('is false outside a secure context', () => {
            Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });
            expect(usePasskeys().isSupported()).toBe(false);
        });
    });

    describe('register', () => {
        it('posts the data for the options and starts the registration with them', async () => {
            const result = await usePasskeys().register('/admin/passkeys/options', { current_password: 'secret' });

            expect(window.axios.post).toHaveBeenCalledWith('/admin/passkeys/options', { current_password: 'secret' });
            expect(startRegistration).toHaveBeenCalledWith({ optionsJSON: options });
            expect(result).toEqual({ id: 'registration' });
        });

        it('rejects with the server error and starts no ceremony', async () => {
            const error = { response: { data: { errors: { current_password: ['Wrong password'] } } } };
            window.axios.post.mockRejectedValueOnce(error);

            await expect(usePasskeys().register('/admin/passkeys/options')).rejects.toBe(error);
            expect(startRegistration).not.toHaveBeenCalled();
        });
    });

    describe('authenticate', () => {
        it('starts the authentication with the server options', async () => {
            const result = await usePasskeys().authenticate('/admin/login/passkey/options');

            expect(window.axios.post).toHaveBeenCalledWith('/admin/login/passkey/options', {});
            expect(startAuthentication).toHaveBeenCalledWith({ optionsJSON: options });
            expect(result).toEqual({ id: 'assertion' });
        });
    });

    describe('autofill', () => {
        it('starts a conditional request', async () => {
            const result = await usePasskeys().autofill('/admin/login/passkey/options');

            expect(startAuthentication).toHaveBeenCalledWith({ optionsJSON: options, useBrowserAutofill: true });
            expect(result).toEqual({ id: 'assertion' });
        });

        it('resolves with null when the browser has no autofill', async () => {
            browserSupportsWebAuthnAutofill.mockResolvedValue(false);

            expect(await usePasskeys().autofill('/admin/login/passkey/options')).toBeNull();
            expect(window.axios.post).not.toHaveBeenCalled();
            expect(startAuthentication).not.toHaveBeenCalled();
        });

        it('resolves with null outside a secure context', async () => {
            Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });

            expect(await usePasskeys().autofill('/admin/login/passkey/options')).toBeNull();
            expect(startAuthentication).not.toHaveBeenCalled();
        });
    });

    it('cancel aborts the pending ceremony', () => {
        usePasskeys().cancel();
        expect(WebAuthnAbortService.cancelCeremony).toHaveBeenCalled();
    });

    it('isCancelled recognises a closed dialog and an aborted ceremony', () => {
        const { isCancelled } = usePasskeys();

        expect(isCancelled({ name: 'NotAllowedError' })).toBe(true);
        expect(isCancelled({ name: 'AbortError' })).toBe(true);
        expect(isCancelled({ code: 'ERROR_CEREMONY_ABORTED' })).toBe(true);
        expect(isCancelled({ name: 'InvalidStateError' })).toBe(false);
        expect(isCancelled(undefined)).toBe(false);
    });

    describe('defaultName', () => {
        it('names the browser and the OS', () => {
            setUserAgent(
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
            );
            expect(usePasskeys().defaultName()).toBe('Chrome on macOS');
        });

        it('uses the given template', () => {
            setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0');
            expect(usePasskeys().defaultName(':browser – :os')).toBe('Firefox – Windows');
        });

        it('tells Edge from Chrome', () => {
            setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36 Edg/140.0',
            );
            expect(usePasskeys().defaultName()).toBe('Edge on Windows');
        });

        it('falls back to what it recognises', () => {
            setUserAgent('Unknown/1.0');
            expect(usePasskeys().defaultName()).toBe('');
        });
    });
});
