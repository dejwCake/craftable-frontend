import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

import RestoreButton from '@/components/listing/RestoreButton.vue';

function mountButton(props = {}) {
    return mount(RestoreButton, {
        props: { url: '/admin/posts/1/restore', ...props },
        attachTo: document.body,
    });
}

describe('RestoreButton', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('renders restore button', () => {
        const wrapper = mountButton();
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders disabled with the reason as title', () => {
        const wrapper = mountButton({ disabled: true });
        expect(wrapper.html()).toMatchSnapshot();
        expect(wrapper.find('button').attributes('disabled')).toBeDefined();
        expect(wrapper.find('span').attributes('title')).toBe(
            'This item cannot be restored, an item it belongs to is deleted.',
        );
    });

    it('shows a success confirm modal on click', async () => {
        const wrapper = mountButton();
        await wrapper.find('button.btn-success').trigger('click');
        expect(document.body.querySelector('.modal-footer .btn-success')).not.toBeNull();
    });

    it('calls axios.post and emits restored on confirm', async () => {
        window.axios.post.mockResolvedValueOnce({ data: { message: 'Restored' } });
        const wrapper = mountButton();
        await wrapper.find('button.btn-success').trigger('click');

        document.body.querySelector('.modal-footer .btn-success').click();
        await flushPromises();

        expect(window.axios.post).toHaveBeenCalledWith('/admin/posts/1/restore');
        expect(wrapper.emitted('restored')).toHaveLength(1);
    });
});
