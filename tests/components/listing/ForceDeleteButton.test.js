import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

import ForceDeleteButton from '@/components/listing/ForceDeleteButton.vue';

function mountButton(props = {}) {
    return mount(ForceDeleteButton, {
        props: { url: '/admin/posts/1/force', ...props },
        attachTo: document.body,
    });
}

describe('ForceDeleteButton', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('renders force delete button', () => {
        const wrapper = mountButton();
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('shows a danger confirm modal on click', async () => {
        const wrapper = mountButton();
        await wrapper.find('button.btn-dark').trigger('click');
        expect(document.body.querySelector('.modal-footer .btn-danger')).not.toBeNull();
    });

    it('calls axios.delete and emits deleted on confirm', async () => {
        window.axios.delete.mockResolvedValueOnce({ data: { message: 'Deleted' } });
        const wrapper = mountButton();
        await wrapper.find('button.btn-dark').trigger('click');

        document.body.querySelector('.modal-footer .btn-danger').click();
        await flushPromises();

        expect(window.axios.delete).toHaveBeenCalledWith('/admin/posts/1/force');
        expect(wrapper.emitted('deleted')).toHaveLength(1);
    });
});
