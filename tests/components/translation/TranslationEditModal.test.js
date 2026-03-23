import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

import TranslationEditModal from '@/translation/modals/TranslationEditModal.vue';

function mountModal(props = {}) {
    return mount(TranslationEditModal, {
        props: {
            show: true,
            item: { id: 1, key: 'test.key', text: { en: 'Hello', sk: 'Ahoj' } },
            locales: ['en', 'sk'],
            url: '/api/translations',
            translations: {
                edit: 'Edit',
                default_text: 'Default',
                translation: 'Translation',
                translation_for: 'Translation for :locale',
                save: 'Save',
            },
            ...props,
        },
    });
}

describe('TranslationEditModal', () => {
    it('populates translationValues from item.text', () => {
        const wrapper = mountModal();
        const inputs = wrapper.findAll('input.form-control');
        expect(inputs[0].element.value).toBe('Hello');
        expect(inputs[1].element.value).toBe('Ahoj');
    });

    it('updates translationValues when item prop changes', async () => {
        const wrapper = mountModal();
        await wrapper.setProps({
            item: { id: 2, key: 'other.key', text: { en: 'World', sk: 'Svet' } },
        });
        const inputs = wrapper.findAll('input.form-control');
        expect(inputs[0].element.value).toBe('World');
        expect(inputs[1].element.value).toBe('Svet');
    });

    it('submits POST and emits saved + close', async () => {
        window.axios.post.mockResolvedValueOnce({ data: {} });
        const wrapper = mountModal();

        await wrapper.find('form').trigger('submit');
        await flushPromises();

        expect(window.axios.post).toHaveBeenCalledWith('/api/translations/1', {
            text: { en: 'Hello', sk: 'Ahoj' },
        });
        expect(wrapper.emitted('saved')).toHaveLength(1);
        expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('renders textarea for long values (>= 70 chars)', () => {
        const longText = 'a'.repeat(70);
        const wrapper = mountModal({
            item: { id: 1, key: 'test.key', text: { en: longText, sk: 'short' } },
        });
        expect(wrapper.findAll('textarea').length).toBe(1);
        expect(wrapper.findAll('input.form-control').length).toBe(1);
    });
});
