import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineRule } from 'vee-validate';
import { max, required } from '@vee-validate/rules';

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

const passkeysMock = {
    isSupported: vi.fn(() => true),
    register: vi.fn(),
    isCancelled: vi.fn((error) => error?.name === 'NotAllowedError'),
    defaultName: vi.fn(() => 'Chrome on macOS'),
};

vi.mock('@craftable/composables/usePasskeys.js', () => ({
    usePasskeys: () => passkeysMock,
}));

import PasskeySettings from '@/account/PasskeySettings.vue';

const macBook = { id: 1, name: 'MacBook', created_at: '2026-11-01', last_used_at: '2026-11-10' };
const yubiKey = { id: 2, name: 'YubiKey', created_at: '2026-11-02', last_used_at: null };

const baseProps = {
    optionsUrl: '/admin/passkeys/options',
    storeUrl: '/admin/passkeys',
    passkeyUrl: '/admin/passkeys/__id__',
    translations: {
        title: 'Passkeys',
        description: 'Sign in with your fingerprint, face or device PIN.',
        empty: 'You have no passkeys yet.',
        add: 'Add a passkey',
        name: 'Name',
        current_password: 'Current password',
        rename: 'Rename',
        save: 'Save',
        remove: 'Remove',
        remove_confirm: 'Enter your password to remove this passkey.',
        cancel: 'Cancel',
        added: 'Added',
        last_used: 'Last used',
        never_used: 'never',
        unsupported: 'This browser cannot use passkeys here.',
        migration_missing: 'Run the migration first.',
        failed: 'The passkey could not be verified.',
    },
};

function mountSettings(props = {}) {
    return mount(PasskeySettings, { props: { ...baseProps, ...props } });
}

describe('PasskeySettings', () => {
    beforeAll(() => {
        defineRule('required', required);
        defineRule('max', max);
    });

    beforeEach(() => {
        passkeysMock.isSupported.mockReturnValue(true);
    });

    it('lists the passkeys with their dates', () => {
        const wrapper = mountSettings({ passkeys: [macBook, yubiKey] });

        expect(wrapper.html()).toMatchSnapshot();
        const names = wrapper.findAll('.passkeys-name').map((item) => item.text());
        expect(names).toEqual(['MacBook', 'YubiKey']);
        expect(wrapper.findAll('.passkeys-dates')[1].text()).toContain('never');
    });

    it('says there are none and offers to add one', () => {
        const wrapper = mountSettings();

        expect(wrapper.html()).toMatchSnapshot();
        expect(wrapper.find('.passkeys-empty').exists()).toBe(true);
        expect(wrapper.find('button.passkeys-add-start').exists()).toBe(true);
    });

    it('shows the unsupported notice without the add action', () => {
        passkeysMock.isSupported.mockReturnValue(false);
        const wrapper = mountSettings({ passkeys: [macBook] });

        expect(wrapper.find('.passkeys-unsupported').exists()).toBe(true);
        expect(wrapper.find('button.passkeys-add-start').exists()).toBe(false);
        // Existing passkeys can still be managed.
        expect(wrapper.find('button.passkeys-remove-start').exists()).toBe(true);
    });

    it('shows the missing-migration notice without the add action', () => {
        const wrapper = mountSettings({ available: false });

        expect(wrapper.html()).toMatchSnapshot();
        expect(wrapper.find('.passkeys-migration-missing').exists()).toBe(true);
        expect(wrapper.find('button.passkeys-add-start').exists()).toBe(false);
    });

    describe('adding', () => {
        it('prefills the name from the browser and the OS', async () => {
            const wrapper = mountSettings();
            await wrapper.find('button.passkeys-add-start').trigger('click');

            expect(wrapper.find('input#name').element.value).toBe('Chrome on macOS');
        });

        it('registers with the password and stores the response with the name', async () => {
            const credential = { id: 'credential' };
            passkeysMock.register.mockResolvedValueOnce(credential);
            window.axios.post.mockResolvedValueOnce({ data: { message: 'Added', passkey: macBook } });
            const wrapper = mountSettings();

            await wrapper.find('button.passkeys-add-start').trigger('click');
            await wrapper.find('input#name').setValue('MacBook');
            await wrapper.find('input#current_password').setValue('secret');
            await wrapper.find('form.passkeys-add').trigger('submit');
            await flushPromises();

            expect(passkeysMock.register).toHaveBeenCalledWith('/admin/passkeys/options', {
                current_password: 'secret',
            });
            expect(window.axios.post).toHaveBeenCalledWith('/admin/passkeys', { name: 'MacBook', credential });
            expect(wrapper.find('.passkeys-name').text()).toBe('MacBook');
            expect(wrapper.find('form.passkeys-add').exists()).toBe(false);
        });

        it('checks the name before the browser creates the passkey', async () => {
            const wrapper = mountSettings();

            await wrapper.find('button.passkeys-add-start').trigger('click');
            await wrapper.find('input#name').setValue('   ');
            await wrapper.find('form.passkeys-add').trigger('submit');
            await flushPromises();

            expect(passkeysMock.register).not.toHaveBeenCalled();
            expect(wrapper.find('input#name').classes()).toContain('is-invalid');
        });

        it('refuses a name longer than the server accepts', async () => {
            const wrapper = mountSettings();

            await wrapper.find('button.passkeys-add-start').trigger('click');
            await wrapper.find('input#name').setValue('x'.repeat(256));
            await wrapper.find('form.passkeys-add').trigger('submit');
            await flushPromises();

            expect(passkeysMock.register).not.toHaveBeenCalled();
        });

        it('shows a wrong password on the field', async () => {
            passkeysMock.register.mockRejectedValueOnce({
                response: { data: { errors: { current_password: ['The password is incorrect.'] } } },
            });
            const wrapper = mountSettings();

            await wrapper.find('button.passkeys-add-start').trigger('click');
            await wrapper.find('form.passkeys-add').trigger('submit');
            await flushPromises();

            expect(wrapper.find('form.passkeys-add .invalid-feedback').text()).toBe('The password is incorrect.');
            expect(window.axios.post).not.toHaveBeenCalled();
        });

        it('shows a rejected response as a general error', async () => {
            passkeysMock.register.mockResolvedValueOnce({ id: 'credential' });
            window.axios.post.mockRejectedValueOnce({
                response: { data: { errors: { passkey: ['The passkey could not be verified.'] } } },
            });
            const wrapper = mountSettings();

            await wrapper.find('button.passkeys-add-start').trigger('click');
            await wrapper.find('form.passkeys-add').trigger('submit');
            await flushPromises();

            expect(wrapper.find('.alert-danger').text()).toBe('The passkey could not be verified.');
            expect(wrapper.find('.passkeys-list').exists()).toBe(false);
        });

        it('stays quiet when the browser dialog is closed', async () => {
            passkeysMock.register.mockRejectedValueOnce({ name: 'NotAllowedError' });
            const wrapper = mountSettings();

            await wrapper.find('button.passkeys-add-start').trigger('click');
            await wrapper.find('form.passkeys-add').trigger('submit');
            await flushPromises();

            expect(wrapper.find('.alert-danger').exists()).toBe(false);
            expect(wrapper.find('form.passkeys-add').exists()).toBe(true);
        });
    });

    describe('renaming', () => {
        it('renames inline', async () => {
            window.axios.patch.mockResolvedValueOnce({
                data: { message: 'Renamed', passkey: { ...macBook, name: 'Work laptop' } },
            });
            const wrapper = mountSettings({ passkeys: [macBook] });

            await wrapper.find('button.passkeys-rename-start').trigger('click');
            expect(wrapper.find('input#rename_name').element.value).toBe('MacBook');
            await wrapper.find('input#rename_name').setValue('Work laptop');
            await wrapper.find('form.passkeys-rename').trigger('submit');
            await flushPromises();

            expect(window.axios.patch).toHaveBeenCalledWith('/admin/passkeys/1', { name: 'Work laptop' });
            expect(wrapper.find('.passkeys-name').text()).toBe('Work laptop');
        });

        it('cancel keeps the old name', async () => {
            const wrapper = mountSettings({ passkeys: [macBook] });

            await wrapper.find('button.passkeys-rename-start').trigger('click');
            await wrapper.find('input#rename_name').setValue('Something else');
            await wrapper.find('button.passkeys-cancel').trigger('click');

            expect(wrapper.find('.passkeys-name').text()).toBe('MacBook');
            expect(window.axios.patch).not.toHaveBeenCalled();
        });
    });

    describe('removing', () => {
        it('removes with the password', async () => {
            window.axios.delete.mockResolvedValueOnce({ data: { message: 'Removed' } });
            const wrapper = mountSettings({ passkeys: [macBook, yubiKey] });

            await wrapper.findAll('button.passkeys-remove-start')[0].trigger('click');
            await wrapper.find('input#remove_current_password').setValue('secret');
            await wrapper.find('form.passkeys-remove').trigger('submit');
            await flushPromises();

            expect(window.axios.delete).toHaveBeenCalledWith('/admin/passkeys/1', {
                data: { current_password: 'secret' },
            });
            expect(wrapper.findAll('.passkeys-name').map((item) => item.text())).toEqual(['YubiKey']);
        });

        it('keeps the passkey when the server refuses', async () => {
            window.axios.delete.mockRejectedValueOnce({
                response: { data: { message: 'This is your last second factor.' } },
            });
            const wrapper = mountSettings({ passkeys: [macBook] });

            await wrapper.find('button.passkeys-remove-start').trigger('click');
            await wrapper.find('form.passkeys-remove').trigger('submit');
            await flushPromises();

            expect(wrapper.find('.alert-danger').text()).toBe('This is your last second factor.');
            expect(wrapper.find('form.passkeys-remove').exists()).toBe(true);
        });
    });
});
