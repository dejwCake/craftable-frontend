import { describe, it, expect } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';

import TwoFactorOverview from '@/account/TwoFactorOverview.vue';

// Stands in for TwoFactorSettings: a factor component that emits `update:active`.
const ManagedFactor = defineComponent({
    name: 'ManagedFactor',
    props: { label: { type: String, default: '' } },
    emits: ['update:active'],
    setup(props, { emit }) {
        return () =>
            h('div', { class: 'managed-factor' }, [
                h('span', { class: 'managed-factor-label' }, props.label),
                h('button', { class: 'managed-on', onClick: () => emit('update:active', true) }),
                h('button', { class: 'managed-off', onClick: () => emit('update:active', false) }),
            ]);
    },
});

const translations = {
    title: 'Two-factor authentication',
    status_on: 'On',
    status_off: 'Off',
    active_via: 'Active: :factors',
    enrolment_required: 'Two-factor authentication is required for your account.',
};

function totp(overrides = {}) {
    return {
        key: 'totp',
        name: 'Authenticator app',
        icon: 'fa fa-mobile-screen',
        available: true,
        active: false,
        status: 'Not set up',
        notice: 'Run the migration.',
        url: null,
        link_label: null,
        component: 'managed-factor',
        props: { label: 'TOTP settings' },
        ...overrides,
    };
}

function passkeys(overrides = {}) {
    return {
        key: 'passkey',
        name: 'Passkeys',
        icon: 'fa fa-fingerprint',
        available: true,
        active: false,
        status: 'None',
        notice: 'Run the passkeys migration.',
        url: '/admin/passkeys',
        link_label: 'Manage passkeys',
        component: null,
        props: {},
        ...overrides,
    };
}

function mountOverview(factors, required = false) {
    return mount(TwoFactorOverview, {
        props: { factors, required, translations },
        global: { components: { ManagedFactor } },
    });
}

describe('TwoFactorOverview', () => {
    it('renders off without an active factor', () => {
        const wrapper = mountOverview([totp(), passkeys()]);

        expect(wrapper.html()).toMatchSnapshot();
        expect(wrapper.find('.two-factor-overall .badge').text()).toBe('Off');
        expect(wrapper.find('.two-factor-active-via').exists()).toBe(false);
    });

    it('renders on through passkeys only', () => {
        const wrapper = mountOverview([totp(), passkeys({ active: true, status: '2 passkeys' })]);

        expect(wrapper.find('.two-factor-overall .badge').text()).toBe('On');
        expect(wrapper.find('.two-factor-active-via').text()).toBe('Active: Passkeys');
        expect(wrapper.find('.two-factor-factor-passkey .badge').text()).toBe('2 passkeys');
    });

    it('names every active factor', () => {
        const wrapper = mountOverview([totp({ active: true }), passkeys({ active: true })]);

        expect(wrapper.find('.two-factor-active-via').text()).toBe('Active: Authenticator app, Passkeys');
    });

    it('mounts a factor component with its props', () => {
        const wrapper = mountOverview([totp(), passkeys()]);

        expect(wrapper.find('.two-factor-factor-totp .managed-factor-label').text()).toBe('TOTP settings');
    });

    it('renders a link factor with its status and link', () => {
        const wrapper = mountOverview([passkeys()]);

        expect(wrapper.find('.two-factor-factor-passkey .badge').text()).toBe('None');
        const link = wrapper.find('.two-factor-factor-passkey a.two-factor-factor-link');
        expect(link.attributes('href')).toBe('/admin/passkeys');
        expect(link.text()).toBe('Manage passkeys');
    });

    it('shows the notice of an unavailable factor instead of its component', () => {
        const wrapper = mountOverview([totp({ available: false, active: true }), passkeys({ active: true })]);

        expect(wrapper.find('.two-factor-factor-totp .two-factor-factor-notice').text()).toBe('Run the migration.');
        expect(wrapper.find('.two-factor-factor-totp .managed-factor').exists()).toBe(false);
        expect(wrapper.find('.two-factor-active-via').text()).toBe('Active: Passkeys');
    });

    it('shows the enrolment notice when required and nothing is active', () => {
        const wrapper = mountOverview([totp(), passkeys()], true);

        expect(wrapper.find('.two-factor-enrolment-required').exists()).toBe(true);
    });

    it('hides the enrolment notice when required and a factor is active', () => {
        const wrapper = mountOverview([totp(), passkeys({ active: true })], true);

        expect(wrapper.find('.two-factor-enrolment-required').exists()).toBe(false);
    });

    it('follows the update:active of a factor component', async () => {
        const wrapper = mountOverview([totp(), passkeys()], true);

        await wrapper.find('button.managed-on').trigger('click');
        expect(wrapper.find('.two-factor-overall .badge').text()).toBe('On');
        expect(wrapper.find('.two-factor-active-via').text()).toBe('Active: Authenticator app');
        expect(wrapper.find('.two-factor-enrolment-required').exists()).toBe(false);

        await wrapper.find('button.managed-off').trigger('click');
        expect(wrapper.find('.two-factor-overall .badge').text()).toBe('Off');
        expect(wrapper.find('.two-factor-enrolment-required').exists()).toBe(true);
    });
});
