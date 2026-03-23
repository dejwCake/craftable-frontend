import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PerPage from '@/components/listing/PerPage.vue';

describe('PerPage', () => {
    it('renders with default value', () => {
        const wrapper = mount(PerPage);
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('emits numeric value on change', async () => {
        const wrapper = mount(PerPage);
        await wrapper.find('select').setValue('25');
        expect(wrapper.emitted('update:modelValue')[0]).toEqual([25]);
    });
});
