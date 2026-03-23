import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FormInput from '@/components/form/FormInput.vue';

describe('FormInput', () => {
    it('renders with default props', () => {
        const wrapper = mount(FormInput, {
            props: { name: 'username', label: 'Username' },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders with error', () => {
        const wrapper = mount(FormInput, {
            props: { name: 'username', label: 'Username', error: 'Required field' },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });
});
