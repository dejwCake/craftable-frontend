import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('@vuepic/vue-datepicker', () => ({
    VueDatePicker: {
        name: 'VueDatePicker',
        template: '<div class="datepicker-stub"></div>',
        props: ['modelValue', 'id', 'name', 'placeholder', 'timeConfig', 'formats', 'autoApply', 'locale', 'inputAttrs'],
    },
}));

import FormDatePicker from '@/components/form/FormDatePicker.vue';

describe('FormDatePicker', () => {
    it('renders with default props', () => {
        const wrapper = mount(FormDatePicker, {
            props: {
                name: 'publish_date',
                label: 'Publish Date',
                config: { format: 'yyyy-MM-dd', locale: 'en' },
            },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders with error', () => {
        const wrapper = mount(FormDatePicker, {
            props: {
                name: 'publish_date',
                label: 'Publish Date',
                config: { format: 'yyyy-MM-dd', locale: 'en' },
                error: 'Invalid date',
            },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });
});
