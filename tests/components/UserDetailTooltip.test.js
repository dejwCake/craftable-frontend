import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('vue3-popper', () => ({
    default: {
        name: 'Popper',
        template: '<div class="popper-stub"><slot /><slot name="content" /></div>',
    },
}));

import UserDetailTooltip from '@/components/UserDetailTooltip.vue';

const user = {
    first_name: 'John',
    last_name: 'Doe',
    full_name: 'John Doe',
    email: 'john@example.com',
    avatar_thumb_url: '',
};

describe('UserDetailTooltip', () => {
    it('renders user initials when no avatar', () => {
        const wrapper = mount(UserDetailTooltip, {
            props: { user },
        });
        expect(wrapper.text()).toContain('JD');
    });

    it('renders user full name', () => {
        const wrapper = mount(UserDetailTooltip, {
            props: { user },
        });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders email link in tooltip content', () => {
        const wrapper = mount(UserDetailTooltip, {
            props: { user },
        });
        expect(wrapper.find('a[href="mailto:john@example.com"]').exists()).toBe(true);
    });
});
