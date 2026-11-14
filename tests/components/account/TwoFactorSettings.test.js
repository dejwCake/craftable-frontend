import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

import TwoFactorSettings from '@/account/TwoFactorSettings.vue';

const baseProps = {
    enableUrl: '/admin/two-factor/enable',
    confirmUrl: '/admin/two-factor/confirm',
    recoveryCodesUrl: '/admin/two-factor/recovery-codes',
    disableUrl: '/admin/two-factor',
    translations: {
        title: 'Two-factor authentication',
        status_on: 'On',
        status_off: 'Off',
        enable: 'Enable',
        enable_description: 'Protect your account with a code from an authenticator app.',
        scan_qr: 'Scan the QR code with your authenticator app.',
        secret_label: 'Or enter the key:',
        code: 'Code',
        confirm: 'Confirm',
        cancel: 'Cancel',
        recovery_codes_title: 'Recovery codes',
        recovery_codes_description: 'Store these codes safely.',
        copy: 'Copy',
        copied: 'Copied',
        download: 'Download',
        done: 'Done',
        current_password: 'Current password',
        regenerate: 'Regenerate recovery codes',
        disable: 'Disable',
        required_notice: 'Two-factor authentication is required for your account.',
    },
};

const recoveryCodes = ['aaaaa-bbbbb', 'ccccc-ddddd'];

async function enrol(wrapper) {
    window.axios.post.mockResolvedValueOnce({ data: { secret: 'JBSWY3DPEHPK3PXP', qr_code: '<svg></svg>' } });
    await wrapper.find('button.two-factor-enable').trigger('click');
    await flushPromises();
}

describe('TwoFactorSettings', () => {
    it('renders the off state', () => {
        const wrapper = mount(TwoFactorSettings, { props: baseProps });
        expect(wrapper.html()).toMatchSnapshot();
        expect(wrapper.find('.two-factor-status').text()).toBe('Off');
        expect(wrapper.find('button.two-factor-enable').exists()).toBe(true);
    });

    it('renders the on state', () => {
        const wrapper = mount(TwoFactorSettings, { props: { ...baseProps, enabled: true } });
        expect(wrapper.html()).toMatchSnapshot();
        expect(wrapper.find('.two-factor-status').text()).toBe('On');
        expect(wrapper.find('button.two-factor-regenerate').exists()).toBe(true);
        expect(wrapper.find('button.two-factor-disable').exists()).toBe(true);
    });

    it('hides disabling when two-factor is required', () => {
        const wrapper = mount(TwoFactorSettings, { props: { ...baseProps, enabled: true, required: true } });
        expect(wrapper.find('button.two-factor-disable').exists()).toBe(false);
        expect(wrapper.find('.two-factor-required').exists()).toBe(true);
    });

    it('goes from off to enrolling with the QR code and secret', async () => {
        const wrapper = mount(TwoFactorSettings, { props: baseProps });
        await enrol(wrapper);

        expect(window.axios.post).toHaveBeenCalledWith('/admin/two-factor/enable');
        expect(wrapper.find('.two-factor-qr').html()).toContain('<svg>');
        expect(wrapper.find('.two-factor-secret').text()).toBe('JBSWY3DPEHPK3PXP');
        const code = wrapper.find('input#code');
        expect(code.attributes('autocomplete')).toBe('one-time-code');
        expect(code.attributes('inputmode')).toBe('numeric');
    });

    it('goes from enrolling to the recovery codes on a valid code, then to on', async () => {
        const wrapper = mount(TwoFactorSettings, { props: baseProps });
        await enrol(wrapper);

        window.axios.post.mockResolvedValueOnce({ data: { recovery_codes: recoveryCodes } });
        await wrapper.find('input#code').setValue('123456');
        await wrapper.find('form').trigger('submit');
        await flushPromises();

        expect(window.axios.post).toHaveBeenLastCalledWith('/admin/two-factor/confirm', { code: '123456' });
        expect(wrapper.findAll('.two-factor-recovery-codes li').map((item) => item.text())).toEqual(recoveryCodes);

        await wrapper.find('button.two-factor-done').trigger('click');
        expect(wrapper.find('.two-factor-status').text()).toBe('On');
        expect(wrapper.find('.two-factor-recovery-codes').exists()).toBe(false);
    });

    it('stays enrolling and shows the error on an invalid code', async () => {
        const wrapper = mount(TwoFactorSettings, { props: baseProps });
        await enrol(wrapper);

        window.axios.post.mockRejectedValueOnce({
            response: { status: 422, data: { errors: { code: ['The code is invalid.'] } } },
        });
        await wrapper.find('input#code').setValue('000000');
        await wrapper.find('form').trigger('submit');
        await flushPromises();

        expect(wrapper.find('input#code').classes()).toContain('is-invalid');
        expect(wrapper.find('.invalid-feedback').text()).toBe('The code is invalid.');
        expect(wrapper.find('.two-factor-recovery-codes').exists()).toBe(false);
    });

    it('goes back to off when enrolment is cancelled', async () => {
        const wrapper = mount(TwoFactorSettings, { props: baseProps });
        await enrol(wrapper);

        await wrapper.find('button.two-factor-cancel').trigger('click');
        expect(wrapper.find('button.two-factor-enable').exists()).toBe(true);
    });

    it('shows the server message when enrolment is not possible', async () => {
        const wrapper = mount(TwoFactorSettings, { props: baseProps });
        window.axios.post.mockRejectedValueOnce({
            response: { status: 409, data: { message: 'Run the migration first.' } },
        });
        await wrapper.find('button.two-factor-enable').trigger('click');
        await flushPromises();

        expect(wrapper.find('.alert-danger').text()).toBe('Run the migration first.');
        expect(wrapper.find('button.two-factor-enable').exists()).toBe(true);
    });

    it('goes from on to the recovery codes when they are regenerated with the password', async () => {
        const wrapper = mount(TwoFactorSettings, { props: { ...baseProps, enabled: true } });
        window.axios.post.mockResolvedValueOnce({ data: { recovery_codes: recoveryCodes } });

        await wrapper.find('input#current_password').setValue('secret');
        await wrapper.find('button.two-factor-regenerate').trigger('click');
        await flushPromises();

        expect(window.axios.post).toHaveBeenCalledWith('/admin/two-factor/recovery-codes', {
            current_password: 'secret',
        });
        expect(wrapper.findAll('.two-factor-recovery-codes li')).toHaveLength(2);
    });

    it('stays on and shows the password error when regenerating with a wrong password', async () => {
        const wrapper = mount(TwoFactorSettings, { props: { ...baseProps, enabled: true } });
        window.axios.post.mockRejectedValueOnce({
            response: { status: 422, data: { errors: { current_password: ['The password is incorrect.'] } } },
        });

        await wrapper.find('input#current_password').setValue('wrong');
        await wrapper.find('button.two-factor-regenerate').trigger('click');
        await flushPromises();

        expect(wrapper.find('input#current_password').classes()).toContain('is-invalid');
        expect(wrapper.find('.two-factor-status').text()).toBe('On');
    });

    it('goes from on to off when disabled with the password', async () => {
        const wrapper = mount(TwoFactorSettings, { props: { ...baseProps, enabled: true } });
        window.axios.delete.mockResolvedValueOnce({ data: { message: 'Disabled.' } });

        await wrapper.find('input#current_password').setValue('secret');
        await wrapper.find('button.two-factor-disable').trigger('click');
        await flushPromises();

        expect(window.axios.delete).toHaveBeenCalledWith('/admin/two-factor', {
            data: { current_password: 'secret' },
        });
        expect(wrapper.find('.two-factor-status').text()).toBe('Off');
    });

    it('copies the recovery codes', async () => {
        const writeText = vi.fn().mockResolvedValue();
        Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
        const wrapper = mount(TwoFactorSettings, { props: { ...baseProps, enabled: true } });
        window.axios.post.mockResolvedValueOnce({ data: { recovery_codes: recoveryCodes } });
        await wrapper.find('button.two-factor-regenerate').trigger('click');
        await flushPromises();

        await wrapper.find('button.two-factor-copy').trigger('click');
        await flushPromises();

        expect(writeText).toHaveBeenCalledWith('aaaaa-bbbbb\nccccc-ddddd\n');
        expect(wrapper.find('button.two-factor-copy').text()).toBe('Copied');
    });
});
