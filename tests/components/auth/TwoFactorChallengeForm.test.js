import { describe, it, expect, vi, beforeAll } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineRule } from 'vee-validate';
import { required } from '@vee-validate/rules';

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

const passkeysMock = {
    isSupported: vi.fn(() => true),
    authenticate: vi.fn(),
    isCancelled: vi.fn((error) => error?.name === 'NotAllowedError'),
};

vi.mock('@craftable/composables/usePasskeys.js', () => ({
    usePasskeys: () => passkeysMock,
}));

import TwoFactorChallengeForm from '@/auth/TwoFactorChallengeForm.vue';

const baseProps = {
    action: '/admin/two-factor/challenge',
    translations: {
        title: 'Two-factor authentication',
        codeText: 'Enter the code from your authenticator app.',
        codeOrPasskeyText: 'Use your passkey or enter the code.',
        recoveryCodeText: 'Enter one of your recovery codes.',
        code: 'Code',
        recoveryCode: 'Recovery code',
        button: 'Verify',
        useRecoveryCode: 'Use a recovery code',
        useCode: 'Use an authentication code',
        passkeyText: 'Confirm it is you with your passkey.',
        usePasskey: 'Use a passkey',
        passkeyUnsupported: 'This browser cannot use passkeys here.',
        or: 'or',
    },
};

const passkeyProps = {
    ...baseProps,
    hasPasskeys: true,
    passkeyOptionsUrl: '/admin/two-factor/challenge/passkey/options',
    passkeyUrl: '/admin/two-factor/challenge/passkey',
};

describe('TwoFactorChallengeForm', () => {
    beforeAll(() => {
        defineRule('required', required);
    });

    it('renders the code mode', () => {
        const wrapper = mount(TwoFactorChallengeForm, { props: baseProps });
        expect(wrapper.html()).toMatchSnapshot();

        const code = wrapper.find('input#code');
        expect(code.attributes('autocomplete')).toBe('one-time-code');
        expect(code.attributes('inputmode')).toBe('numeric');
        expect(wrapper.find('input#recovery_code').exists()).toBe(false);
    });

    it('posts the code and follows the returned redirect', async () => {
        const replace = vi.spyOn(window.location, 'replace').mockImplementation(() => {});
        window.axios.post.mockResolvedValueOnce({ data: { redirect: '/admin/posts' } });
        const wrapper = mount(TwoFactorChallengeForm, { props: baseProps });

        await wrapper.find('input#code').setValue('123456');
        await wrapper.find('form').trigger('submit');
        await flushPromises();

        expect(window.axios.post).toHaveBeenCalledWith('/admin/two-factor/challenge', {
            code: '123456',
            recovery_code: '',
        });
        expect(replace).toHaveBeenCalledWith('/admin/posts');
        replace.mockRestore();
    });

    it('does not post an empty code', async () => {
        const wrapper = mount(TwoFactorChallengeForm, { props: baseProps });
        await wrapper.find('form').trigger('submit');
        await flushPromises();

        expect(window.axios.post).not.toHaveBeenCalled();
        expect(wrapper.find('input#code').classes()).toContain('is-invalid');
    });

    it('clears the error of the code when switching to the recovery code and back', async () => {
        const wrapper = mount(TwoFactorChallengeForm, { props: baseProps });
        await wrapper.find('form').trigger('submit');
        await flushPromises();

        await wrapper.find('button.toggle-link').trigger('click');
        await wrapper.find('button.toggle-link').trigger('click');

        expect(wrapper.find('input#code').classes()).not.toContain('is-invalid');
    });

    it('switches to the recovery code mode and posts the recovery code', async () => {
        const replace = vi.spyOn(window.location, 'replace').mockImplementation(() => {});
        window.axios.post.mockResolvedValueOnce({ data: {} });
        const wrapper = mount(TwoFactorChallengeForm, { props: baseProps });

        await wrapper.find('button.toggle-link').trigger('click');
        expect(wrapper.find('input#code').exists()).toBe(false);
        expect(wrapper.find('button.toggle-link').text()).toBe('Use an authentication code');

        await wrapper.find('input#recovery_code').setValue('aaaaa-bbbbb');
        await wrapper.find('form').trigger('submit');
        await flushPromises();

        expect(window.axios.post).toHaveBeenCalledWith('/admin/two-factor/challenge', {
            code: '',
            recovery_code: 'aaaaa-bbbbb',
        });
        // No redirect in the response: falls back to the redirectUrl prop.
        expect(replace).toHaveBeenCalledWith('/admin');
        replace.mockRestore();
    });

    it('shows the server error on the code', async () => {
        window.axios.post.mockRejectedValueOnce({
            response: { data: { errors: { code: ['The code is invalid.'] } } },
        });
        const wrapper = mount(TwoFactorChallengeForm, { props: baseProps });

        await wrapper.find('input#code').setValue('000000');
        await wrapper.find('form').trigger('submit');
        await flushPromises();

        expect(wrapper.find('input#code').classes()).toContain('is-invalid');
        expect(wrapper.find('.invalid-feedback').text()).toBe('The code is invalid.');
    });

    describe('passkeys', () => {
        it('offers only codes with TOTP only', () => {
            const wrapper = mount(TwoFactorChallengeForm, { props: baseProps });

            expect(wrapper.find('button.passkey-btn').exists()).toBe(false);
            expect(wrapper.find('input#code').exists()).toBe(true);
            expect(wrapper.find('.auth-subtitle').text()).toBe('Enter the code from your authenticator app.');
        });

        it('offers only the passkey with passkeys only', () => {
            const wrapper = mount(TwoFactorChallengeForm, { props: { ...passkeyProps, hasTotp: false } });

            expect(wrapper.html()).toMatchSnapshot();
            expect(wrapper.find('button.passkey-btn').text()).toBe('Use a passkey');
            expect(wrapper.find('.auth-subtitle').text()).toBe('Confirm it is you with your passkey.');
            expect(wrapper.find('input#code').exists()).toBe(false);
            expect(wrapper.find('button.toggle-link').exists()).toBe(false);
            expect(wrapper.find('button.submit-btn').exists()).toBe(false);
        });

        it('offers the passkey first, then the code, with both', () => {
            const wrapper = mount(TwoFactorChallengeForm, { props: passkeyProps });

            expect(wrapper.html()).toMatchSnapshot();
            const html = wrapper.html();
            expect(html.indexOf('passkey-btn')).toBeLessThan(html.indexOf('id="code"'));
            expect(wrapper.find('.passkey-or').exists()).toBe(true);
            expect(wrapper.find('.auth-subtitle').text()).toBe('Use your passkey or enter the code.');
        });

        it('falls back to the code text with both when the view has no combined text', () => {
            const { codeOrPasskeyText: _, ...translations } = baseProps.translations;
            const wrapper = mount(TwoFactorChallengeForm, { props: { ...passkeyProps, translations } });

            expect(wrapper.find('.auth-subtitle').text()).toBe('Enter the code from your authenticator app.');
        });

        it('shows the recovery code text with both in the recovery code mode', async () => {
            const wrapper = mount(TwoFactorChallengeForm, { props: passkeyProps });
            await wrapper.find('button.toggle-link').trigger('click');

            expect(wrapper.find('.auth-subtitle').text()).toBe('Enter one of your recovery codes.');
        });

        it('says the browser cannot use passkeys', () => {
            passkeysMock.isSupported.mockReturnValueOnce(false);
            const wrapper = mount(TwoFactorChallengeForm, { props: { ...passkeyProps, hasTotp: false } });

            expect(wrapper.find('.passkey-unsupported').exists()).toBe(true);
            expect(wrapper.find('button.passkey-btn').exists()).toBe(false);
        });

        it('verifies with a passkey and follows the returned redirect', async () => {
            const replace = vi.spyOn(window.location, 'replace').mockImplementation(() => {});
            passkeysMock.authenticate.mockResolvedValueOnce({ id: 'assertion' });
            window.axios.post.mockResolvedValueOnce({ data: { redirect: '/admin/posts' } });
            const wrapper = mount(TwoFactorChallengeForm, { props: passkeyProps });

            await wrapper.find('button.passkey-btn').trigger('click');
            await flushPromises();

            expect(passkeysMock.authenticate).toHaveBeenCalledWith('/admin/two-factor/challenge/passkey/options');
            expect(window.axios.post).toHaveBeenCalledWith('/admin/two-factor/challenge/passkey', {
                credential: { id: 'assertion' },
            });
            expect(replace).toHaveBeenCalledWith('/admin/posts');
            replace.mockRestore();
        });

        it('shows a rejected passkey', async () => {
            passkeysMock.authenticate.mockResolvedValueOnce({ id: 'assertion' });
            window.axios.post.mockRejectedValueOnce({
                response: { data: { errors: { passkey: ['The passkey could not be verified.'] } } },
            });
            const wrapper = mount(TwoFactorChallengeForm, { props: passkeyProps });

            await wrapper.find('button.passkey-btn').trigger('click');
            await flushPromises();

            expect(wrapper.find('.passkey-error').text()).toBe('The passkey could not be verified.');
        });

        it('stays quiet when the dialog is closed', async () => {
            passkeysMock.authenticate.mockRejectedValueOnce({ name: 'NotAllowedError' });
            const wrapper = mount(TwoFactorChallengeForm, { props: passkeyProps });

            await wrapper.find('button.passkey-btn').trigger('click');
            await flushPromises();

            expect(wrapper.find('.passkey-error').exists()).toBe(false);
            expect(window.axios.post).not.toHaveBeenCalled();
        });
    });
});
