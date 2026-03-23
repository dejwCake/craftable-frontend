import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('vue3-cookies', () => ({
    useCookies: () => ({
        cookies: { get: vi.fn(), set: vi.fn(), remove: vi.fn() },
    }),
}));

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

import ResetPasswordForm from '@/auth/ResetPasswordForm.vue';

const baseProps = {
    action: '/admin/password-reset/reset',
    token: 'test-token-123',
    translations: {
        title: 'Reset Password',
        note: 'Enter your new password',
        email: 'Email',
        password: 'Password',
        passwordConfirm: 'Confirm Password',
        button: 'Reset Password',
        backToLogin: 'Back to login',
    },
    loginUrl: '/admin/login',
    email: 'test@example.com',
};

describe('ResetPasswordForm', () => {
    it('renders reset password form', () => {
        const wrapper = mount(ResetPasswordForm, { props: baseProps });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders email, password, and confirmation fields', () => {
        const wrapper = mount(ResetPasswordForm, { props: baseProps });
        expect(wrapper.find('input#email').exists()).toBe(true);
        expect(wrapper.find('input#password').exists()).toBe(true);
        expect(wrapper.find('input#password_confirmation').exists()).toBe(true);
    });

    it('renders server errors', () => {
        const wrapper = mount(ResetPasswordForm, {
            props: { ...baseProps, serverErrors: ['Token expired'] },
        });
        expect(wrapper.find('.alert-danger').text()).toContain('Token expired');
    });
});
