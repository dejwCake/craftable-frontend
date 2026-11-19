import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

import { notify } from '@kyvg/vue3-notification';
import SecurityResetButton from '@/components/listing/SecurityResetButton.vue';

const url = '/admin/admin-users/2/security-reset';

function mountButton() {
    return mount(SecurityResetButton, { props: { url }, attachTo: document.body });
}

async function openAndSubmit(wrapper, password = 'secret') {
    await wrapper.find('button.security-reset-btn').trigger('click');
    const input = document.body.querySelector('#security_reset_current_password');
    input.value = password;
    input.dispatchEvent(new Event('input'));
    document.body.querySelector('form.security-reset-form').dispatchEvent(new Event('submit'));
    await flushPromises();
}

describe('SecurityResetButton', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('renders the row button', () => {
        const wrapper = mountButton();

        expect(wrapper.html()).toMatchSnapshot();
        expect(wrapper.find('button.btn-sm.btn-info i.fa-shield').exists()).toBe(true);
        expect(document.body.querySelector('.modal')).toBeNull();
    });

    it('opens the password modal and cancels without a request', async () => {
        const wrapper = mountButton();
        await wrapper.find('button.security-reset-btn').trigger('click');

        expect(document.body.querySelector('.modal #security_reset_current_password')).not.toBeNull();

        document.body.querySelector('button.security-reset-cancel').click();
        await flushPromises();

        expect(document.body.querySelector('.modal')).toBeNull();
        expect(window.axios.post).not.toHaveBeenCalled();
    });

    it('posts the password, notifies and emits reset', async () => {
        window.axios.post.mockResolvedValueOnce({ data: { message: 'Two-factor authentication was reset.' } });
        const wrapper = mountButton();

        await openAndSubmit(wrapper);

        expect(window.axios.post).toHaveBeenCalledWith(url, { current_password: 'secret' });
        expect(notify).toHaveBeenCalledWith(expect.objectContaining({ text: 'Two-factor authentication was reset.' }));
        expect(wrapper.emitted('reset')).toHaveLength(1);
        expect(document.body.querySelector('.modal')).toBeNull();
    });

    it('keeps a wrong password in the modal', async () => {
        window.axios.post.mockRejectedValueOnce({
            response: { data: { errors: { current_password: ['The password is incorrect.'] } } },
        });
        const wrapper = mountButton();

        await openAndSubmit(wrapper, 'wrong');

        expect(document.body.querySelector('.modal .invalid-feedback').textContent).toBe('The password is incorrect.');
        expect(wrapper.emitted('reset')).toBeUndefined();
    });

    it('closes and notifies a refused request', async () => {
        window.axios.post.mockRejectedValueOnce({
            response: { status: 403, data: { message: 'This action is unauthorized.' } },
        });
        const wrapper = mountButton();

        await openAndSubmit(wrapper);

        expect(document.body.querySelector('.modal')).toBeNull();
        expect(notify).toHaveBeenCalledWith(expect.objectContaining({ text: 'This action is unauthorized.' }));
        expect(wrapper.emitted('reset')).toBeUndefined();
    });
});
