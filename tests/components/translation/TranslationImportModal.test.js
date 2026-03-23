import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

vi.mock('vue-multiselect', () => ({
    default: {
        name: 'Multiselect',
        template: '<div class="multiselect-stub"></div>',
        props: ['modelValue', 'options', 'trackBy', 'label', 'placeholder', 'allowEmpty', 'showLabels', 'openDirection'],
        emits: ['update:modelValue'],
    },
}));

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

import TranslationImportModal from '@/translation/modals/TranslationImportModal.vue';

const baseProps = {
    show: true,
    locales: ['en', 'sk'],
    url: '/api/translations',
    translations: {
        import_title: 'Import Translations',
        import_notice: 'Upload an xlsx file',
        upload_file: 'File',
        choose_file: 'Choose file',
        language_to_import: 'Language',
        select_language: 'Select language',
        do_not_override: 'Only missing',
        next: 'Next',
        conflict_found: 'Found',
        conflict_to_import: 'translations,',
        conflict_differ: 'differ from current.',
        group: 'Group',
        default: 'Default',
        current_value: 'Current',
        imported_value: 'Imported',
        successfully_imported: 'imported,',
        successfully_updated: 'updated.',
    },
};

function mountModal(props = {}) {
    return mount(TranslationImportModal, {
        props: { ...baseProps, ...props },
    });
}

describe('TranslationImportModal', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders step 1 with file upload and language select', () => {
        const wrapper = mountModal();
        expect(wrapper.find('.modal').exists()).toBe(true);
        expect(wrapper.text()).toContain('Upload an xlsx file');
        expect(wrapper.find('input[type="file"]').exists()).toBe(true);
    });

    it('shows validation error when clicking next without file or language', async () => {
        const { notify } = await import('@kyvg/vue3-notification');
        const wrapper = mountModal();
        await wrapper.find('.modal-footer button').trigger('click');
        await flushPromises();
        expect(notify).toHaveBeenCalled();
    });

    it('advances to step 3 on successful import without conflicts', async () => {
        window.axios.post.mockResolvedValueOnce({
            data: {
                numberOfImportedTranslations: 5,
                numberOfUpdatedTranslations: 2,
            },
        });

        const wrapper = mountModal();

        // Simulate file selection
        const fileInput = wrapper.find('input[type="file"]');
        const file = new File(['test'], 'translations.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        Object.defineProperty(fileInput.element, 'files', { value: [file] });
        await fileInput.trigger('change');

        // Set language via vm (since Multiselect is stubbed)
        wrapper.vm.importLanguageObj = { id: 'sk', name: 'SK' };
        await wrapper.vm.$nextTick();

        // Click next
        await wrapper.find('.modal-footer button').trigger('click');
        await flushPromises();

        expect(window.axios.post).toHaveBeenCalled();
        expect(wrapper.text()).toContain('5');
        expect(wrapper.text()).toContain('2');
        expect(wrapper.emitted('imported')).toHaveLength(1);
    });

    it('advances to step 2 on import with conflicts', async () => {
        window.axios.post.mockResolvedValueOnce({
            data: [
                { group: 'auth', default: 'Login', current_value: 'Prihlasit', has_conflict: true, sk: 'Prihlasenie' },
            ],
        });

        const wrapper = mountModal();

        const fileInput = wrapper.find('input[type="file"]');
        const file = new File(['test'], 'translations.xlsx');
        Object.defineProperty(fileInput.element, 'files', { value: [file] });
        await fileInput.trigger('change');

        wrapper.vm.importLanguageObj = { id: 'sk', name: 'SK' };
        await wrapper.vm.$nextTick();

        await wrapper.find('.modal-footer button').trigger('click');
        await flushPromises();

        expect(wrapper.text()).toContain('auth');
        expect(wrapper.text()).toContain('Login');
    });

    it('resets state when modal is closed', async () => {
        const wrapper = mountModal();

        // Simulate some state
        const fileInput = wrapper.find('input[type="file"]');
        const file = new File(['test'], 'translations.xlsx');
        Object.defineProperty(fileInput.element, 'files', { value: [file] });
        await fileInput.trigger('change');

        // Close modal
        await wrapper.setProps({ show: false });
        await wrapper.vm.$nextTick();

        // Reopen
        await wrapper.setProps({ show: true });
        await wrapper.vm.$nextTick();

        // File should be cleared (importedFile is null)
        expect(wrapper.text()).toContain('Choose file');
    });
});
