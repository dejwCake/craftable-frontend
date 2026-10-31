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

    it('renders only the buttons whose handlers are given', () => {
        const wrapper = mount(BulkOperationsBar, {
            props: { ...baseProps, onBulkDelete: null, onBulkRestore: vi.fn(), onBulkForceDelete: vi.fn() },
        });
        expect(wrapper.html()).toMatchSnapshot();
        expect(wrapper.find('button.btn-danger').exists()).toBe(false);
    });

    it('calls onBulkRestore and onBulkForceDelete on their buttons', async () => {
        const restoreFn = vi.fn();
        const forceDeleteFn = vi.fn();
        const wrapper = mount(BulkOperationsBar, {
            props: { ...baseProps, onBulkRestore: restoreFn, onBulkForceDelete: forceDeleteFn },
        });
        await wrapper.find('button.btn-success').trigger('click');
        await wrapper.find('button.btn-dark').trigger('click');
        expect(restoreFn).toHaveBeenCalledOnce();
        expect(forceDeleteFn).toHaveBeenCalledOnce();
    });

    it('renders the slot instead of the buttons', () => {
        const wrapper = mount(BulkOperationsBar, {
            props: baseProps,
            slots: { default: '<button class="custom">Custom</button>' },
        });
        expect(wrapper.find('button.custom').exists()).toBe(true);
        expect(wrapper.find('button.btn-danger').exists()).toBe(false);
        expect(wrapper.find('.d-inline-flex').exists()).toBe(false);
    });
});
