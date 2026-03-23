import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('vue-multiselect', () => ({
    default: {
        name: 'Multiselect',
        template: '<div class="multiselect-stub"><slot /></div>',
        props: ['modelValue', 'options', 'label', 'trackBy', 'placeholder', 'openDirection'],
    },
}));

import FormSelect from '@/components/form/FormSelect.vue';

describe('FormSelect', () => {
    it('renders with options', () => {
        const wrapper = mount(FormSelect, {
            props: {
                name: 'role',
                label: 'Role',
                options: ['admin', 'editor', 'viewer'],
            },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders with error', () => {
        const wrapper = mount(FormSelect, {
            props: {
                name: 'role',
                label: 'Role',
                options: ['admin', 'editor'],
                error: 'Selection required',
            },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });
});
