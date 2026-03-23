import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BulkOperationsBar from '@/components/listing/BulkOperationsBar.vue';

const baseProps = {
    selectedCount: 3,
    totalCount: 10,
    onCheckAll: vi.fn(),
    onUncheckAll: vi.fn(),
    onBulkDelete: vi.fn(),
};

describe('BulkOperationsBar', () => {
    it('renders with selected count', () => {
        const wrapper = mount(BulkOperationsBar, { props: baseProps });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('shows check all link when not all selected', () => {
        const wrapper = mount(BulkOperationsBar, { props: baseProps });
        expect(wrapper.text()).toContain('Check all items');
    });

    it('calls onBulkDelete on delete button click', async () => {
        const deleteFn = vi.fn();
        const wrapper = mount(BulkOperationsBar, {
            props: { ...baseProps, onBulkDelete: deleteFn },
        });
        await wrapper.find('button.btn-danger').trigger('click');
        expect(deleteFn).toHaveBeenCalledOnce();
    });
});
