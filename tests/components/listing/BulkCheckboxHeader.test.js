import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BulkCheckboxHeader from '@/components/listing/BulkCheckboxHeader.vue';

describe('BulkCheckboxHeader', () => {
    it('renders unchecked', () => {
        const wrapper = mount(BulkCheckboxHeader, {
            props: { isClickedAll: false, onToggleAll: vi.fn() },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('calls onToggleAll on click', async () => {
        const toggleFn = vi.fn();
        const wrapper = mount(BulkCheckboxHeader, {
            props: { isClickedAll: false, onToggleAll: toggleFn },
        });
        await wrapper.find('input').trigger('click');
        expect(toggleFn).toHaveBeenCalledOnce();
    });
});
