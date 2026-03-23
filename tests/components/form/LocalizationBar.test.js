import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('vue-multiselect', () => ({
    default: {
        name: 'Multiselect',
        template: '<div class="multiselect-stub"></div>',
        props: ['modelValue', 'options', 'customLabel', 'searchable', 'allowEmpty'],
        emits: ['update:modelValue'],
    },
}));

import LocalizationBar from '@/components/form/LocalizationBar.vue';

const baseProps = {
    translations: {
        currently_editing_translation: 'Editing :locale version',
        more_can_be_managed: '(:count more can be managed)',
        manage_translations: 'Manage translations',
        choose_translation_to_edit: 'Choose translation:',
        hide: 'Hide',
    },
    locales: ['en', 'sk', 'cs'],
    defaultLocale: 'en',
    otherLocales: ['sk', 'cs'],
    isFormLocalized: false,
    currentLocale: 'en',
};

describe('LocalizationBar', () => {
    it('renders non-localized state', () => {
        const wrapper = mount(LocalizationBar, { props: baseProps });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('shows currently editing text with locale', () => {
        const wrapper = mount(LocalizationBar, { props: baseProps });
        expect(wrapper.text()).toContain('Editing EN version');
    });

    it('renders localized state with locale selector', () => {
        const wrapper = mount(LocalizationBar, {
            props: { ...baseProps, isFormLocalized: true },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('emits show-localization on link click', async () => {
        const wrapper = mount(LocalizationBar, { props: baseProps });
        await wrapper.find('a').trigger('click');
        expect(wrapper.emitted('show-localization')).toHaveLength(1);
    });
});
