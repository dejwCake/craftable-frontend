import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Search from '@/components/listing/Search.vue';

describe('Search', () => {
    let filterFn;

    beforeEach(() => {
        vi.useFakeTimers();
        filterFn = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    function mountSearch(props = {}) {
        return mount(Search, {
            props: {
                search: '',
                filterFn,
                ...props,
            },
        });
    }

    it('emits update:search on input', async () => {
        const wrapper = mountSearch();
        const input = wrapper.find('input');
        await input.setValue('hello');
        expect(wrapper.emitted('update:search')[0][0]).toBe('hello');
    });

    it('calls filterFn after debounce', async () => {
        const wrapper = mountSearch({ debounce: 400 });
        const input = wrapper.find('input');
        await input.setValue('hello');
        expect(filterFn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(400);
        expect(filterFn).toHaveBeenCalledWith('search', 'hello');
    });

    it('enter triggers immediate search', async () => {
        const wrapper = mountSearch({ search: 'test' });
        const input = wrapper.find('input');
        await input.trigger('keyup.enter');
        expect(filterFn).toHaveBeenCalledWith('search', expect.any(String));
    });

    it('clearSearch emits empty and calls filterFn', async () => {
        const wrapper = mountSearch({ search: 'test' });
        const clearBtn = wrapper.find('button.text-danger');
        await clearBtn.trigger('click');
        expect(wrapper.emitted('update:search').pop()[0]).toBe('');
        expect(filterFn).toHaveBeenCalledWith('search', '');
    });

    it('rapid inputs only dispatch final value after debounce', async () => {
        const wrapper = mountSearch({ debounce: 300 });
        const input = wrapper.find('input');

        await input.setValue('a');
        vi.advanceTimersByTime(100);
        await input.setValue('ab');
        vi.advanceTimersByTime(100);
        await input.setValue('abc');
        vi.advanceTimersByTime(300);

        // Only the last value should have been dispatched
        expect(filterFn).toHaveBeenCalledTimes(1);
        expect(filterFn).toHaveBeenCalledWith('search', 'abc');
    });
});
