import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EditButton from '@/components/listing/EditButton.vue';

describe('EditButton', () => {
    it('renders with url', () => {
        const wrapper = mount(EditButton, {
            props: { url: '/admin/posts/1/edit' },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders with custom translations', () => {
        const wrapper = mount(EditButton, {
            props: {
                url: '/admin/posts/1/edit',
                translations: { edit_btn: 'Upravit' },
            },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });
});
