import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BackButton from '@/components/BackButton.vue';

describe('BackButton', () => {
    it('renders with url', () => {
        const wrapper = mount(BackButton, {
            props: { url: '/admin/posts' },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders with custom translations', () => {
        const wrapper = mount(BackButton, {
            props: {
                url: '/admin/posts',
                translations: { back: 'Späť' },
            },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });
});
