import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('vue-multiselect', () => ({
    default: {
        name: 'Multiselect',
        template: '<div class="multiselect-stub"><slot /></div>',
        props: ['modelValue', 'options', 'label', 'trackBy', 'placeholder', 'multiple', 'openDirection'],
        emits: ['update:modelValue'],
    },
}));

import FormMultiSelect from '@/components/form/FormMultiSelect.vue';

describe('FormMultiSelect', () => {
    it('renders with options', () => {
        const wrapper = mount(FormMultiSelect, {
            props: {
                name: 'tags',
                label: 'Tags',
                options: [{ id: 1, name: 'Vue' }, { id: 2, name: 'React' }],
            },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders with error', () => {
        const wrapper = mount(FormMultiSelect, {
            props: {
                name: 'tags',
                label: 'Tags',
                options: [{ id: 1, name: 'Vue' }],
                error: 'Required',
            },
        });
        expect(wrapper.find('.invalid-feedback').text()).toBe('Required');
    });
});
