import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ReadOnlySwitch from '@/components/ReadOnlySwitch.vue';

describe('ReadOnlySwitch', () => {
    it('renders checked for a truthy value', () => {
        const wrapper = mount(ReadOnlySwitch, { props: { modelValue: true } });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders unchecked for a falsy value', () => {
        const wrapper = mount(ReadOnlySwitch, { props: { modelValue: false } });

        expect(wrapper.html()).toMatchSnapshot();
    });

    // A JSON listing payload carries 0/1 rather than false/true for a tinyint column.
    // Note: an empty string is NOT covered here. Vue casts '' to true because Boolean leads the
    // prop's type array, exactly as it does for ToggleSwitch, which declares the same types.
    it('accepts the numeric forms a listing payload may carry', () => {
        expect(mount(ReadOnlySwitch, { props: { modelValue: 1 } }).find('input').element.checked).toBe(true);
        expect(mount(ReadOnlySwitch, { props: { modelValue: 0 } }).find('input').element.checked).toBe(false);
    });

    it('is always disabled, so it cannot be toggled', () => {
        const wrapper = mount(ReadOnlySwitch, { props: { modelValue: true } });

        expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });

    it('emits nothing when clicked', async () => {
        const wrapper = mount(ReadOnlySwitch, { props: { modelValue: false } });

        await wrapper.find('input').trigger('click');

        expect(wrapper.emitted()).toEqual({});
    });

    it('renders the requested variant', () => {
        const wrapper = mount(ReadOnlySwitch, { props: { modelValue: true, variant: 'danger' } });

        expect(wrapper.find('input').classes()).toContain('form-switch-danger');
    });
});
