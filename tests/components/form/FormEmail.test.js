import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FormEmail from '@/components/form/FormEmail.vue';

describe('FormEmail', () => {
    it('renders with default props', () => {
        const wrapper = mount(FormEmail, {
            props: { name: 'email', label: 'Email' },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders with error', () => {
        const wrapper = mount(FormEmail, {
            props: { name: 'email', label: 'Email', error: 'Invalid email' },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });
});
