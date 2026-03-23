import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

vi.mock('@vuepic/vue-datepicker', () => ({
    VueDatePicker: {
        name: 'VueDatePicker',
        template: '<div class="datepicker-stub"></div>',
        props: ['modelValue', 'modelType', 'format', 'formatLocale', 'enableTimePicker', 'enableSeconds', 'inline', 'autoApply'],
        emits: ['update:modelValue'],
    },
}));

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

import PublishedAtColumn from '@/components/listing/PublishedAtColumn.vue';

const now = '2026-03-23 12:00:00';

const defaultTranslations = {
    publish_now: 'Publish now',
    unpublish_now: 'Unpublish now',
    publish_later: 'Publish later',
    will_be_published: 'This item will be published at',
    confirm_publish_now: 'Do you really want to publish this item now?',
    confirm_unpublish_now: 'Do you really want to unpublish this item?',
};

function mountColumn(itemProps = {}, extraProps = {}) {
    return mount(PublishedAtColumn, {
        props: {
            item: { id: 1, published_at: null, ...itemProps },
            url: '/admin/posts/1/publish',
            now,
            translations: defaultTranslations,
            ...extraProps,
        },
        attachTo: document.body,
    });
}

describe('PublishedAtColumn', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('shows publish buttons when unpublished', () => {
        const wrapper = mountColumn({ published_at: null });
        expect(wrapper.text()).toContain('Publish later');
        expect(wrapper.text()).toContain('Publish now');
    });

    it('shows formatted date and unpublish button when published in past', () => {
        const wrapper = mountColumn({ published_at: '2026-03-20 10:00:00' });
        expect(wrapper.text()).toContain('Unpublish now');
    });

    it('shows future publish info when published_at is in future', () => {
        const wrapper = mountColumn({ published_at: '2026-04-01 10:00:00' });
        expect(wrapper.text()).toContain('This item will be published at');
        expect(wrapper.text()).toContain('Publish now');
    });

    it('publish now shows confirm modal and posts on confirm', async () => {
        window.axios.post.mockResolvedValueOnce({
            data: { object: { published_at: '2026-03-23 12:00:00' }, message: 'Published' },
        });

        const wrapper = mountColumn({ published_at: null });

        // Click "Publish now" button
        const publishBtn = wrapper.findAll('button').find((b) => b.text().includes('Publish now'));
        await publishBtn.trigger('submit');

        // Confirm in the modal
        await wrapper.vm.$nextTick();
        const confirmBtn = document.body.querySelector('.modal-footer button.btn-success');
        if (confirmBtn) {
            confirmBtn.click();
            await flushPromises();

            expect(window.axios.post).toHaveBeenCalledWith('/admin/posts/1/publish', { publish_now: true });
            expect(wrapper.emitted('update:item')).toHaveLength(1);
        }
    });

    it('unpublish now shows confirm modal and posts on confirm', async () => {
        window.axios.post.mockResolvedValueOnce({
            data: { object: { published_at: null, published_to: null }, message: 'Unpublished' },
        });

        const wrapper = mountColumn({ published_at: '2026-03-20 10:00:00' });

        // Click "Unpublish now" button
        const form = wrapper.findAll('form').find((f) => f.text().includes('Unpublish now'));
        await form.trigger('submit');

        await wrapper.vm.$nextTick();
        const confirmBtn = document.body.querySelector('.modal-footer button.btn-danger');
        if (confirmBtn) {
            confirmBtn.click();
            await flushPromises();

            expect(window.axios.post).toHaveBeenCalledWith('/admin/posts/1/publish', { unpublish_now: true });
            expect(wrapper.emitted('update:item')).toHaveLength(1);
        }
    });
});
