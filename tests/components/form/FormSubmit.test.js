import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FormSubmit from '@/components/form/FormSubmit.vue';

describe('FormSubmit', () => {
    it('renders default state', () => {
        const wrapper = mount(FormSubmit);
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders submitting state', () => {
        const wrapper = mount(FormSubmit, {
            props: { submitting: true },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });
});
