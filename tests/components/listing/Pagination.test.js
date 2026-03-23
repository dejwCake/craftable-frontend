import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('vue3-cookies', () => ({
    useCookies: () => ({
        cookies: {
            get: vi.fn().mockReturnValue('10'),
            set: vi.fn(),
        },
    }),
}));

import Pagination from '@/components/listing/Pagination.vue';

function mountPagination(paginationState = {}, options = {}) {
    return mount(Pagination, {
        props: {
            pagination: {
                current_page: 1,
                last_page: 10,
                total: 100,
                per_page: 10,
                from: 1,
                to: 10,
                ...paginationState,
            },
            options,
        },
    });
}

describe('Pagination', () => {
    describe('page array', () => {
        it('generates correct window at page 1 with offset 3', () => {
            const wrapper = mountPagination({ current_page: 1, last_page: 10 });
            const links = wrapper.findAll('li.page-item a.page-link');
            const pageNumbers = links.map((l) => l.text()).filter((t) => !isNaN(t));
            expect(pageNumbers).toEqual(['1', '2', '3', '4', '5', '6', '7']);
        });

        it('generates correct window at middle page', () => {
            const wrapper = mountPagination({ current_page: 5, last_page: 10 });
            const links = wrapper.findAll('li.page-item a.page-link');
            const pageNumbers = links.map((l) => l.text()).filter((t) => !isNaN(t));
            expect(pageNumbers).toEqual(['2', '3', '4', '5', '6', '7', '8']);
        });

        it('clamps at last page', () => {
            const wrapper = mountPagination({ current_page: 9, last_page: 10 });
            const links = wrapper.findAll('li.page-item a.page-link');
            const pageNumbers = links.map((l) => l.text()).filter((t) => !isNaN(t));
            expect(pageNumbers[pageNumbers.length - 1]).toBe('10');
        });

        it('returns empty when last_page is 0', () => {
            const wrapper = mountPagination({ current_page: 1, last_page: 0, total: 0 });
            expect(wrapper.findAll('li.page-item').length).toBe(0);
        });
    });

    describe('overview', () => {
        it('interpolates from, to, total', () => {
            const wrapper = mountPagination({ from: 11, to: 20, total: 50 });
            expect(wrapper.find('.pagination-caption').text()).toContain('11');
            expect(wrapper.find('.pagination-caption').text()).toContain('20');
            expect(wrapper.find('.pagination-caption').text()).toContain('50');
        });
    });

    describe('changePage', () => {
        it('does not emit for same page', async () => {
            const wrapper = mountPagination({ current_page: 1 });
            // Find and click page 1 link
            const pageLinks = wrapper.findAll('li.page-item a.page-link');
            const page1 = pageLinks.find((l) => l.text() === '1');
            if (page1) await page1.trigger('click');
            expect(wrapper.emitted('page-change')).toBeUndefined();
        });

        it('emits page-change for different page', async () => {
            const wrapper = mountPagination({ current_page: 1 });
            const pageLinks = wrapper.findAll('li.page-item a.page-link');
            const page2 = pageLinks.find((l) => l.text() === '2');
            if (page2) await page2.trigger('click');
            expect(wrapper.emitted('page-change')[0][0]).toBe(2);
        });
    });

    describe('showPrevious/showNext', () => {
        it('hides previous on page 1 without alwaysShowPrevNext', () => {
            const wrapper = mountPagination({ current_page: 1 });
            const prevItems = wrapper.findAll('li.page-item');
            // First item should not have a clickable prev link
            const firstItem = prevItems[0];
            expect(firstItem.text()).toContain('1'); // It's a page number, not "Previous"
        });

        it('shows previous on page 1 with alwaysShowPrevNext', () => {
            const wrapper = mountPagination({ current_page: 1 }, { alwaysShowPrevNext: true });
            const text = wrapper.text();
            expect(text).toContain('Previous');
        });
    });
});
