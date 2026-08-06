import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('vue-multiselect', () => ({
    default: {
        name: 'Multiselect',
        template: '<div class="multiselect-stub"><slot /></div>',
        props: ['modelValue', 'options', 'placeholder', 'multiple', 'taggable', 'closeOnSelect', 'tagPlaceholder', 'openDirection'],
        emits: ['update:modelValue', 'tag'],
    },
}));

import FormTagInput from '@/components/form/FormTagInput.vue';

describe('FormTagInput', () => {
    it('renders with tags', () => {
        const wrapper = mount(FormTagInput, {
            props: {
                name: 'tags',
                label: 'Tags',
                modelValue: ['vue', 'laravel'],
            },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('appends a new tag on the tag event', async () => {
        const wrapper = mount(FormTagInput, {
            props: {
                name: 'tags',
                label: 'Tags',
                modelValue: ['vue'],
            },
        });

        await wrapper.findComponent({ name: 'Multiselect' }).vm.$emit('tag', 'laravel');

        expect(wrapper.emitted('update:modelValue')[0]).toEqual([['vue', 'laravel']]);
    });

    it('renders with error', () => {
        const wrapper = mount(FormTagInput, {
            props: {
                name: 'tags',
                label: 'Tags',
                modelValue: [],
                error: 'Required',
            },
        });
        expect(wrapper.find('.invalid-feedback').text()).toBe('Required');
    });
});
