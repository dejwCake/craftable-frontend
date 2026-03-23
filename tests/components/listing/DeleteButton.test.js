import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

import DeleteButton from '@/components/listing/DeleteButton.vue';

function mountButton(props = {}) {
    return mount(DeleteButton, {
        props: { url: '/admin/posts/1', ...props },
        attachTo: document.body,
    });
}

describe('DeleteButton', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('renders delete button', () => {
        const wrapper = mountButton();
        expect(wrapper.find('button.btn-danger').exists()).toBe(true);
    });

    it('shows confirm modal on click', async () => {
        const wrapper = mountButton();
        await wrapper.find('button.btn-danger').trigger('click');
        const modal = document.body.querySelector('.modal');
        expect(modal).not.toBeNull();
    });

    it('calls axios.delete and emits deleted on confirm', async () => {
        window.axios.delete.mockResolvedValueOnce({ data: { message: 'Deleted' } });
        const wrapper = mountButton();
        await wrapper.find('button.btn-danger').trigger('click');

        // Find and click confirm button in teleported modal
        const buttons = document.body.querySelectorAll('.modal-footer button');
        // DeleteButton's default translations use confirm_btn: 'Delete'
        const confirmBtn = [...buttons].find(b => b.textContent.trim() === 'Delete');
        confirmBtn.click();
        await flushPromises();

        expect(window.axios.delete).toHaveBeenCalledWith('/admin/posts/1');
        expect(wrapper.emitted('deleted')).toHaveLength(1);
    });
});
