import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineRule } from 'vee-validate';
import { email, required } from '@vee-validate/rules';

vi.mock('vue3-cookies', () => ({
    useCookies: () => ({
        cookies: { get: vi.fn(), set: vi.fn(), remove: vi.fn() },
    }),
}));

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

const passkeysMock = {
    isSupported: vi.fn(() => true),
    authenticate: vi.fn(),
    autofill: vi.fn(() => Promise.resolve(null)),
    cancel: vi.fn(),
    isCancelled: vi.fn((error) => error?.name === 'NotAllowedError'),
};

vi.mock('@craftable/composables/usePasskeys.js', () => ({
    usePasskeys: () => passkeysMock,
}));

import LoginForm from '@/auth/LoginForm.vue';

const baseProps = {
    action: '/admin/login',
    translations: {
        title: 'Login',
        signInText: 'Sign in to your account',
        email: 'Email',
        password: 'Password',
        button: 'Login',
        forgotPassword: 'Forgot password?',
        passkeyButton: 'Sign in with a passkey',
    },
    passwordResetUrl: '/admin/password-reset',
};

describe('LoginForm', () => {
    beforeAll(() => {
        defineRule('required', required);
        defineRule('email', email);
    });

    it('renders login form', () => {
        const wrapper = mount(LoginForm, { props: baseProps });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders email and password fields', () => {
        const wrapper = mount(LoginForm, { props: baseProps });
        expect(wrapper.find('input#email').exists()).toBe(true);
        expect(wrapper.find('input#password').exists()).toBe(true);
    });

    it('renders status message when provided', () => {
        const wrapper = mount(LoginForm, {
            props: { ...baseProps, statusMessage: 'Password reset link sent' },
        });
        expect(wrapper.find('.alert-success').text()).toBe('Password reset link sent');
    });

    it('submits the password login unchanged', async () => {
        window.axios.post.mockResolvedValueOnce({ data: {} });
        const wrapper = mount(LoginForm, { props: baseProps });

        await wrapper.find('input#email').setValue('john@example.com');
        await wrapper.find('input#password').setValue('secret');
        await wrapper.find('form').trigger('submit');
        await flushPromises();

        expect(window.axios.post).toHaveBeenCalledWith('/admin/login', {
            email: 'john@example.com',
            password: 'secret',
        });
    });

    describe('without the passkey props', () => {
        it('has no passkey button, autofill or webauthn autocomplete', async () => {
            const wrapper = mount(LoginForm, { props: baseProps });
            await flushPromises();

            expect(wrapper.find('button.passkey-btn').exists()).toBe(false);
            expect(wrapper.find('input#email').attributes('autocomplete')).toBeUndefined();
            expect(passkeysMock.autofill).not.toHaveBeenCalled();
        });
    });

    describe('with the passkey props', () => {
        const passkeyProps = {
            ...baseProps,
            passkeyOptionsUrl: '/admin/login/passkey/options',
            passkeyLoginUrl: '/admin/login/passkey',
        };
        let replace;

        beforeEach(() => {
            passkeysMock.isSupported.mockReturnValue(true);
            passkeysMock.autofill.mockResolvedValue(null);
            replace = vi.spyOn(window.location, 'replace').mockImplementation(() => {});
        });

        afterEach(() => {
            replace.mockRestore();
        });

        it('renders the button and the webauthn autocomplete', () => {
            const wrapper = mount(LoginForm, { props: passkeyProps });

            expect(wrapper.html()).toMatchSnapshot();
            expect(wrapper.find('button.passkey-btn').text()).toBe('Sign in with a passkey');
            // Not `.w-100`, which the auth card pads like a primary button.
            expect(wrapper.find('button.passkey-btn').classes()).not.toContain('w-100');
            expect(wrapper.find('input#email').attributes('autocomplete')).toBe('username webauthn');
        });

        it('hides the button in a browser without passkeys', () => {
            passkeysMock.isSupported.mockReturnValue(false);
            const wrapper = mount(LoginForm, { props: passkeyProps });

            expect(wrapper.find('button.passkey-btn').exists()).toBe(false);
            expect(passkeysMock.autofill).not.toHaveBeenCalled();
        });

        it('signs in with the button and follows the redirect', async () => {
            passkeysMock.authenticate.mockResolvedValueOnce({ id: 'assertion' });
            window.axios.post.mockResolvedValueOnce({ status: 204, data: '' });
            const wrapper = mount(LoginForm, { props: passkeyProps });

            await wrapper.find('button.passkey-btn').trigger('click');
            await flushPromises();

            expect(passkeysMock.authenticate).toHaveBeenCalledWith('/admin/login/passkey/options');
            expect(window.axios.post).toHaveBeenCalledWith('/admin/login/passkey', {
                credential: { id: 'assertion' },
                remember: true,
            });
            expect(replace).toHaveBeenCalledWith('/admin');
        });

        it('signs in with the autofill', async () => {
            passkeysMock.autofill.mockResolvedValueOnce({ id: 'autofill' });
            window.axios.post.mockResolvedValueOnce({ status: 204, data: '' });
            mount(LoginForm, { props: passkeyProps });
            await flushPromises();

            expect(passkeysMock.autofill).toHaveBeenCalledWith('/admin/login/passkey/options');
            expect(window.axios.post).toHaveBeenCalledWith('/admin/login/passkey', {
                credential: { id: 'autofill' },
                remember: true,
            });
            expect(replace).toHaveBeenCalledWith('/admin');
        });

        it('shows a rejected login and offers the autofill again', async () => {
            passkeysMock.authenticate.mockResolvedValueOnce({ id: 'assertion' });
            window.axios.post.mockRejectedValueOnce({
                response: { data: { errors: { passkey: ['The passkey could not be verified.'] } } },
            });
            const wrapper = mount(LoginForm, { props: passkeyProps });
            await flushPromises();

            await wrapper.find('button.passkey-btn').trigger('click');
            await flushPromises();

            expect(wrapper.find('.passkey-error').text()).toBe('The passkey could not be verified.');
            expect(replace).not.toHaveBeenCalled();
            expect(passkeysMock.autofill).toHaveBeenCalledTimes(2);
        });

        it('starts one ceremony at a time', async () => {
            let finish;
            passkeysMock.authenticate.mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));
            window.axios.post.mockResolvedValueOnce({ status: 204, data: '' });
            const wrapper = mount(LoginForm, { props: passkeyProps });
            await flushPromises();

            await wrapper.find('button.passkey-btn').trigger('click');
            await wrapper.find('button.passkey-btn').trigger('click');
            expect(wrapper.find('button.passkey-btn').attributes('disabled')).toBeDefined();
            finish({ id: 'assertion' });
            await flushPromises();

            expect(passkeysMock.authenticate).toHaveBeenCalledTimes(1);
            expect(replace).toHaveBeenCalledWith('/admin');
            expect(passkeysMock.autofill).toHaveBeenCalledTimes(1);
        });

        it('stays quiet when the dialog is closed', async () => {
            passkeysMock.authenticate.mockRejectedValueOnce({ name: 'NotAllowedError' });
            const wrapper = mount(LoginForm, { props: passkeyProps });

            await wrapper.find('button.passkey-btn').trigger('click');
            await flushPromises();

            expect(wrapper.find('.passkey-error').exists()).toBe(false);
            expect(window.axios.post).not.toHaveBeenCalled();
        });

        it('cancels the autofill when the form is left', () => {
            const wrapper = mount(LoginForm, { props: passkeyProps });
            wrapper.unmount();

            expect(passkeysMock.cancel).toHaveBeenCalled();
        });
    });
});
