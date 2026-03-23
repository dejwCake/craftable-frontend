import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FormCheckbox from '@/components/form/FormCheckbox.vue';

describe('FormCheckbox', () => {
    it('renders unchecked', () => {
        const wrapper = mount(FormCheckbox, {
            props: { name: 'active', label: 'Active', modelValue: false },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders checked', () => {
        const wrapper = mount(FormCheckbox, {
            props: { name: 'active', label: 'Active', modelValue: true },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });
});
