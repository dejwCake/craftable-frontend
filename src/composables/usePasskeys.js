import {
    browserSupportsWebAuthn,
    browserSupportsWebAuthnAutofill,
    startAuthentication,
    startRegistration,
    WebAuthnAbortService,
} from '@simplewebauthn/browser';

const BROWSERS = [
    ['Edg/', 'Edge'],
    ['OPR/', 'Opera'],
    ['Firefox/', 'Firefox'],
    ['Chrome/', 'Chrome'],
    ['Safari/', 'Safari'],
];

const SYSTEMS = [
    ['iPhone', 'iOS'],
    ['iPad', 'iPadOS'],
    ['Android', 'Android'],
    ['Mac OS X', 'macOS'],
    ['Windows', 'Windows'],
    ['CrOS', 'ChromeOS'],
    ['Linux', 'Linux'],
];

function detect(list, userAgent) {
    return list.find(([needle]) => userAgent.includes(needle))?.[1] || '';
}

/**
 * Passkey (WebAuthn) ceremonies against the admin-auth endpoints. Each options endpoint answers with
 * the options JSON; the ceremony result is posted back by the caller.
 */
export function usePasskeys() {
    const axios = window.axios;

    /**
     * WebAuthn needs both browser support and a secure context (HTTPS or localhost).
     */
    function isSupported() {
        return window.isSecureContext === true && browserSupportsWebAuthn();
    }

    async function fetchOptions(optionsUrl, data = {}) {
        const response = await axios.post(optionsUrl, data);

        return response.data;
    }

    /**
     * Create a passkey: options from the server (with the current password), then the browser dialog.
     */
    async function register(optionsUrl, data = {}) {
        const optionsJSON = await fetchOptions(optionsUrl, data);

        return startRegistration({ optionsJSON });
    }

    /**
     * Sign with a passkey after a click; cancels a pending autofill request first.
     */
    async function authenticate(optionsUrl) {
        const optionsJSON = await fetchOptions(optionsUrl);

        return startAuthentication({ optionsJSON });
    }

    /**
     * Offer passkeys in the autofill of an input with `autocomplete="username webauthn"`. Resolves
     * with the response once the user picks one, or with null when the browser has no autofill.
     */
    async function autofill(optionsUrl) {
        if (!isSupported() || !(await browserSupportsWebAuthnAutofill())) {
            return null;
        }

        const optionsJSON = await fetchOptions(optionsUrl);

        return startAuthentication({ optionsJSON, useBrowserAutofill: true });
    }

    /**
     * Stop a pending ceremony, e.g. the autofill request when the form is left.
     */
    function cancel() {
        WebAuthnAbortService.cancelCeremony();
    }

    /**
     * The user closed the browser dialog, or a newer ceremony replaced this one; not worth an error.
     */
    function isCancelled(error) {
        return (
            error?.name === 'AbortError' ||
            error?.name === 'NotAllowedError' ||
            error?.code === 'ERROR_CEREMONY_ABORTED'
        );
    }

    /**
     * A name for a new passkey from the browser and the OS, e.g. "Chrome on macOS".
     */
    function defaultName(template = ':browser on :os') {
        const userAgent = window.navigator?.userAgent || '';
        const browser = detect(BROWSERS, userAgent);
        const os = detect(SYSTEMS, userAgent);
        if (!browser || !os) {
            return browser || os;
        }

        return template.replace(':browser', browser).replace(':os', os);
    }

    return {
        isSupported,
        register,
        authenticate,
        autofill,
        cancel,
        isCancelled,
        defaultName,
    };
}
