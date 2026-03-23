import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BulkCheckboxRow from '@/components/listing/BulkCheckboxRow.vue';

describe('BulkCheckboxRow', () => {
    it('renders unchecked', () => {
        const wrapper = mount(BulkCheckboxRow, {
            props: { itemId: 5, onToggle: vi.fn() },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('calls onToggle with itemId on click', async () => {
        const toggleFn = vi.fn();
        const wrapper = mount(BulkCheckboxRow, {
            props: { itemId: 5, onToggle: toggleFn },
        });
        await wrapper.find('input').trigger('click');
        expect(toggleFn).toHaveBeenCalledWith(5);
    });
});
