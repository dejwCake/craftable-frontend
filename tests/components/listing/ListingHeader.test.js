import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ListingHeader from '@/components/listing/ListingHeader.vue';

describe('ListingHeader', () => {
    it('renders with default props', () => {
        const wrapper = mount(ListingHeader);
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders with create button', () => {
        const wrapper = mount(ListingHeader, {
            props: {
                createUrl: '/admin/posts/create',
                translations: { listing_title: 'Posts', create_btn: 'New Post' },
            },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });
});
