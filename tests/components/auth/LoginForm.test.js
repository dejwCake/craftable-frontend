import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

vi.mock('vue3-cookies', () => ({
    useCookies: () => ({
        cookies: { get: vi.fn(), set: vi.fn(), remove: vi.fn() },
    }),
}));

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
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
    },
    passwordResetUrl: '/admin/password-reset',
};

describe('LoginForm', () => {
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
});
