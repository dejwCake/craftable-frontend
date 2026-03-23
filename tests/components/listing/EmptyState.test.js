import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EmptyState from '@/components/listing/EmptyState.vue';

describe('EmptyState', () => {
    it('renders with default props', () => {
        const wrapper = mount(EmptyState);
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders with create button', () => {
        const wrapper = mount(EmptyState, {
            props: { createUrl: '/admin/posts/create' },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders nothing when show is false', () => {
        const wrapper = mount(EmptyState, {
            props: { show: false },
        });
        expect(wrapper.html()).toBe('<!--v-if-->');
    });
});
