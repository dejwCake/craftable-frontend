import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Sortable from '@/components/listing/Sortable.vue';

describe('Sortable', () => {
    it('emits sort with desc when same column is asc', async () => {
        const wrapper = mount(Sortable, {
            props: { column: 'name', orderBy: { column: 'name', direction: 'asc' } },
        });
        await wrapper.find('a').trigger('click');
        expect(wrapper.emitted('sort')[0][0]).toEqual({ column: 'name', direction: 'desc' });
    });

    it('emits sort with asc when same column is desc', async () => {
        const wrapper = mount(Sortable, {
            props: { column: 'name', orderBy: { column: 'name', direction: 'desc' } },
        });
        await wrapper.find('a').trigger('click');
        expect(wrapper.emitted('sort')[0][0]).toEqual({ column: 'name', direction: 'asc' });
    });

    it('emits sort with asc for a different column', async () => {
        const wrapper = mount(Sortable, {
            props: { column: 'email', orderBy: { column: 'name', direction: 'desc' } },
        });
        await wrapper.find('a').trigger('click');
        expect(wrapper.emitted('sort')[0][0]).toEqual({ column: 'email', direction: 'asc' });
    });
});
