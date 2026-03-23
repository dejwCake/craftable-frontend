import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FormLocalizedInput from '@/components/form/FormLocalizedInput.vue';

const baseProps = {
    modelValue: { en: 'Hello', sk: 'Ahoj' },
    name: 'title',
    label: 'Title',
    locales: ['en', 'sk'],
    shouldShowLangGroup: (locale) => locale === 'en',
    isFormLocalized: true,
};

describe('FormLocalizedInput', () => {
    it('renders inputs for each locale', () => {
        const wrapper = mount(FormLocalizedInput, { props: baseProps });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('shows only active locale input', () => {
        const wrapper = mount(FormLocalizedInput, { props: baseProps, attachTo: document.body });
        const inputs = wrapper.findAll('input[type="text"]');
        // v-show uses display:none, check visibility
        expect(inputs[0].isVisible()).toBe(true);
        expect(inputs[1].isVisible()).toBe(false);
        wrapper.unmount();
    });

    it('emits update:modelValue with locale-keyed object on input', async () => {
        const wrapper = mount(FormLocalizedInput, { props: baseProps });
        const input = wrapper.find('#title_en');
        await input.setValue('Hi');
        expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ en: 'Hi', sk: 'Ahoj' });
    });
});
