import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ShowButton from '@/components/listing/ShowButton.vue';

describe('ShowButton', () => {
    it('renders with url', () => {
        const wrapper = mount(ShowButton, {
            props: { url: '/admin/posts/1' },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders with custom translations', () => {
        const wrapper = mount(ShowButton, {
            props: {
                url: '/admin/posts/1',
                translations: { show_btn: 'Zobrazit' },
            },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });
});
