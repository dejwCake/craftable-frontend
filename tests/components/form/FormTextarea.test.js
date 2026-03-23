import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FormTextarea from '@/components/form/FormTextarea.vue';

describe('FormTextarea', () => {
    it('renders with default props', () => {
        const wrapper = mount(FormTextarea, {
            props: { name: 'bio', label: 'Bio' },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders with error', () => {
        const wrapper = mount(FormTextarea, {
            props: { name: 'bio', label: 'Bio', error: 'Too long' },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });
});
