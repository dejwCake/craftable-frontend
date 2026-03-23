import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FormPasswordConfirm from '@/components/form/FormPasswordConfirm.vue';

describe('FormPasswordConfirm', () => {
    it('renders with default props', () => {
        const wrapper = mount(FormPasswordConfirm, {
            props: {
                translations: { password: 'Password', password_repeat: 'Repeat password' },
            },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders with errors', () => {
        const wrapper = mount(FormPasswordConfirm, {
            props: {
                translations: { password: 'Password', password_repeat: 'Repeat password' },
                passwordError: 'Too short',
                confirmationError: 'Does not match',
            },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });
});
