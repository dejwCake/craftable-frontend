import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ActivationError from '@/auth/ActivationError.vue';

describe('ActivationError', () => {
    it('renders with default props', () => {
        const wrapper = mount(ActivationError, {
            props: {
                translations: { title: 'Activation Error' },
            },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders with server errors', () => {
        const wrapper = mount(ActivationError, {
            props: {
                translations: { title: 'Activation Error' },
                serverErrors: ['Token expired', 'User not found'],
            },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });
});
