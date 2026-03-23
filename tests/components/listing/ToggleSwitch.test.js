import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

import ToggleSwitch from '@/components/listing/ToggleSwitch.vue';

function mountToggle(props = {}) {
    return mount(ToggleSwitch, {
        props: {
            modelValue: false,
            url: '/api/items/1',
            column: 'visible',
            row: { id: 1, visible: false },
            ...props,
        },
    });
}

describe('ToggleSwitch', () => {
    it('renders checked state from modelValue', () => {
        const wrapper = mountToggle({ modelValue: true });
        expect(wrapper.find('input').element.checked).toBe(true);
    });

    it('emits update:modelValue with negated value on toggle', async () => {
        const wrapper = mountToggle({ modelValue: false });
        window.axios.post.mockResolvedValueOnce({ data: { message: 'OK' } });
        await wrapper.find('input').trigger('change');
        expect(wrapper.emitted('update:modelValue')[0][0]).toBe(true);
    });

    it('calls axios.post with correct data', async () => {
        const wrapper = mountToggle({ modelValue: false, row: { id: 1, visible: false } });
        window.axios.post.mockResolvedValueOnce({ data: { message: 'OK' } });
        await wrapper.find('input').trigger('change');
        expect(window.axios.post).toHaveBeenCalledWith('/api/items/1', { id: 1, visible: true });
    });

    it('rolls back on error', async () => {
        const wrapper = mountToggle({ modelValue: false });
        window.axios.post.mockRejectedValueOnce({ response: { data: { message: 'Error' } } });
        await wrapper.find('input').trigger('change');

        // First emit: optimistic update to true
        expect(wrapper.emitted('update:modelValue')[0][0]).toBe(true);

        await flushPromises();

        // Second emit: rollback to original value (false)
        expect(wrapper.emitted('update:modelValue')[1][0]).toBe(false);
    });

    it('applies variant class', () => {
        const wrapper = mountToggle({ variant: 'danger' });
        expect(wrapper.find('input').classes()).toContain('form-switch-danger');
    });
});
