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

import ForgotPasswordForm from '@/auth/ForgotPasswordForm.vue';

const baseProps = {
    action: '/admin/password-reset',
    translations: {
        title: 'Reset Password',
        note: 'Enter your email to reset',
        email: 'Email',
        button: 'Send reset link',
        backToLogin: 'Back to login',
    },
    loginUrl: '/admin/login',
};

describe('ForgotPasswordForm', () => {
    it('renders forgot password form', () => {
        const wrapper = mount(ForgotPasswordForm, { props: baseProps });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders email field', () => {
        const wrapper = mount(ForgotPasswordForm, { props: baseProps });
        expect(wrapper.find('input#email').exists()).toBe(true);
    });
});
