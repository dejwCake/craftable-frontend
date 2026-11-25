import { describe, it, expect, vi, beforeAll } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineRule } from 'vee-validate';
import { required, min, confirmed } from '@vee-validate/rules';

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

import PasswordChangeForm from '@/account/PasswordChangeForm.vue';

const baseProps = {
    action: '/admin/password',
    translations: {
        form_title: 'Change password',
        columns: {
            current_password: 'Current password',
            password: 'New password',
            password_repeat: 'Repeat new password',
        },
        save: 'Save',
    },
};

describe('PasswordChangeForm', () => {
    beforeAll(() => {
        defineRule('required', required);
        defineRule('min', min);
        defineRule('confirmed', confirmed);
    });

    it('renders the password change form', () => {
        const wrapper = mount(PasswordChangeForm, { props: baseProps });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders current, new and repeated password fields', () => {
        const wrapper = mount(PasswordChangeForm, { props: baseProps });
        expect(wrapper.find('input#current_password').attributes('type')).toBe('password');
        expect(wrapper.find('input#password').exists()).toBe(true);
        expect(wrapper.find('input#password_confirmation').exists()).toBe(true);
    });

    it('does not post an empty form', async () => {
        const wrapper = mount(PasswordChangeForm, { props: baseProps });
        await wrapper.find('form').trigger('submit');
        await flushPromises();

        expect(window.axios.post).not.toHaveBeenCalled();
        expect(wrapper.find('input#current_password').classes()).toContain('is-invalid');
        expect(wrapper.find('input#password').classes()).toContain('is-invalid');
    });

    it('does not post when the confirmation differs', async () => {
        const wrapper = mount(PasswordChangeForm, { props: baseProps });
        await wrapper.find('input#current_password').setValue('Old-secret1');
        await wrapper.find('input#password').setValue('New-secret1!');
        await wrapper.find('input#password_confirmation').setValue('Other-secret1!');
        await wrapper.find('form').trigger('submit');
        await flushPromises();

        expect(window.axios.post).not.toHaveBeenCalled();
        expect(wrapper.find('input#password').classes()).toContain('is-invalid');
        expect(wrapper.find('input#password_confirmation').classes()).not.toContain('is-invalid');
    });

    it('posts only the three fields when valid', async () => {
        window.axios.post.mockResolvedValue({ data: {} });
        const wrapper = mount(PasswordChangeForm, { props: baseProps });
        await wrapper.find('input#current_password').setValue('Old-secret1');
        await wrapper.find('input#password').setValue('New-secret1!');
        await wrapper.find('input#password_confirmation').setValue('New-secret1!');
        await wrapper.find('form').trigger('submit');
        await flushPromises();

        expect(window.axios.post).toHaveBeenCalledWith('/admin/password', {
            current_password: 'Old-secret1',
            password: 'New-secret1!',
            password_confirmation: 'New-secret1!',
            wysiwygMedia: [],
        });
    });
});
