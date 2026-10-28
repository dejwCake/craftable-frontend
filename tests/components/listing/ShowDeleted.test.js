import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ShowDeleted from '@/components/listing/ShowDeleted.vue';

describe('ShowDeleted', () => {
    it('renders unchecked by default', () => {
        const wrapper = mount(ShowDeleted);
        expect(wrapper.html()).toMatchSnapshot();
        expect(wrapper.find('input').element.checked).toBe(false);
    });

    it('renders with custom translations', () => {
        const wrapper = mount(ShowDeleted, {
            props: { modelValue: true, translations: { show_deleted: 'Zobraziť zmazané' } },
        });
        expect(wrapper.text()).toBe('Zobraziť zmazané');
        expect(wrapper.find('input').element.checked).toBe(true);
    });

    it('emits update:modelValue on change', async () => {
        const wrapper = mount(ShowDeleted);
        await wrapper.find('input').setValue(true);
        expect(wrapper.emitted('update:modelValue')).toEqual([[true]]);
    });
});
