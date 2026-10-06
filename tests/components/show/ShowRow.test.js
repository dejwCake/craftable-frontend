import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ShowRow from '@/components/show/ShowRow.vue';

describe('ShowRow', () => {
    it('renders a label and value', () => {
        const wrapper = mount(ShowRow, { props: { label: 'Monitor', value: 'Example monitor' } });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders an empty value without a placeholder', () => {
        const wrapper = mount(ShowRow, { props: { label: 'Sent at', value: '' } });

        expect(wrapper.find('span').text()).toBe('');
    });

    it('renders slot content instead of the value when one is given', () => {
        const wrapper = mount(ShowRow, {
            props: { label: 'Up', value: 'ignored' },
            slots: { default: '<em>a control</em>' },
        });

        expect(wrapper.html()).toContain('<em>a control</em>');
        expect(wrapper.text()).not.toContain('ignored');
    });

    it('accepts numeric and boolean values', () => {
        expect(mount(ShowRow, { props: { label: 'ID', value: 42 } }).text()).toContain('42');
        expect(mount(ShowRow, { props: { label: 'Up', value: true } }).text()).toContain('true');
    });
});
