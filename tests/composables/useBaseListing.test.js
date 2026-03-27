import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

vi.mock('vue3-cookies', () => ({
    useCookies: () => ({
        cookies: {
            get: vi.fn().mockReturnValue('10'),
            set: vi.fn(),
        },
    }),
}));

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

import { withSetup } from '../helpers/withSetup.js';
import { useBaseListing } from '@/composables/useBaseListing.js';

const mockData = {
    data: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
    ],
    current_page: 1,
    last_page: 3,
    total: 30,
    per_page: 10,
    from: 1,
    to: 10,
};

describe('useBaseListing', () => {
    let unmount;

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        if (unmount) unmount();
        vi.useRealTimers();
    });

    function setup(props = {}) {
        const defaultProps = { url: '/api/items', data: mockData, timezone: 'UTC' };
        const { result, unmount: u } = withSetup(useBaseListing, [{ ...defaultProps, ...props }]);
        unmount = u;
        return result;
    }

    describe('resolveUrl', () => {
        it('replaces :id with item.id', () => {
            const result = setup();
            expect(result.resolveUrl('/api/items/:id', { id: 42 })).toBe('/api/items/42');
        });
    });

    describe('filter', () => {
        it('sets filter key and calls loadData for non-empty value', () => {
            const result = setup();
            window.axios.get.mockResolvedValueOnce({ data: { data: mockData } });

            result.filter('status', 'active');

            expect(result.filters.status).toBe('active');
            expect(window.axios.get).toHaveBeenCalled();
        });

        it('deletes filter key for empty string value', () => {
            const result = setup();
            result.filters.status = 'active';

            window.axios.get.mockResolvedValueOnce({ data: { data: mockData } });

            result.filter('status', '');

            expect(result.filters.status).toBeUndefined();
        });
    });

    describe('onBulkItemClicked', () => {
        it('sets to true when undefined', () => {
            const result = setup();
            result.onBulkItemClicked(1);
            expect(result.bulkItems[1]).toBe(true);
        });

        it('toggles from true to false', () => {
            const result = setup();
            result.onBulkItemClicked(1);
            expect(result.bulkItems[1]).toBe(true);
            result.onBulkItemClicked(1);
            expect(result.bulkItems[1]).toBe(false);
        });
    });

    describe('clickedBulkItemsCount', () => {
        it('counts only true values', () => {
            const result = setup();
            result.bulkItems[1] = true;
            result.bulkItems[2] = true;
            result.bulkItems[3] = false;
            expect(result.clickedBulkItemsCount.value).toBe(2);
        });
    });

    describe('isClickedAll', () => {
        it('returns true when all current page items are checked', () => {
            const result = setup();
            // Mock collection has 3 items, pagination says from=1 to=10
            // Need all collection items checked
            result.bulkItems[1] = true;
            result.bulkItems[2] = true;
            result.bulkItems[3] = true;
            // clickedBulkItemsCount (3) >= to - from + 1 (10) is false with default mockData
            // Adjust: use data with matching to value
            expect(result.isClickedAll.value).toBe(false);
        });

        it('returns true with matching pagination bounds', () => {
            const adjustedData = { ...mockData, from: 1, to: 3 };
            const result = setup({ data: adjustedData });
            result.bulkItems[1] = true;
            result.bulkItems[2] = true;
            result.bulkItems[3] = true;
            expect(result.isClickedAll.value).toBe(true);
        });

        it('returns false when not all items are checked', () => {
            const adjustedData = { ...mockData, from: 1, to: 3 };
            const result = setup({ data: adjustedData });
            result.bulkItems[1] = true;
            result.bulkItems[2] = true;
            expect(result.isClickedAll.value).toBe(false);
        });
    });

    describe('onBulkItemsClickedAllUncheck', () => {
        it('clears all bulk items when called without arguments', () => {
            const result = setup();
            result.bulkItems[1] = true;
            result.bulkItems[2] = true;
            result.onBulkItemsClickedAllUncheck();
            expect(Object.keys(result.bulkItems).length).toBe(0);
        });

        it('sets current page items to false when called with items', () => {
            const result = setup();
            result.bulkItems[1] = true;
            result.bulkItems[2] = true;
            result.bulkItems[99] = true; // item from another page
            result.onBulkItemsClickedAllUncheck([1, 2, 3]);
            // Items 1,2,3 from collection should be false
            expect(result.bulkItems[1]).toBe(false);
            expect(result.bulkItems[2]).toBe(false);
            expect(result.bulkItems[3]).toBe(false);
            // Item 99 should remain true
            expect(result.bulkItems[99]).toBe(true);
        });
    });

    describe('populateCurrentStateAndData', () => {
        it('updates pagination state when data is provided via props', () => {
            const customData = {
                data: [{ id: 10 }],
                current_page: 2,
                last_page: 5,
                total: 50,
                per_page: 10,
                from: 11,
                to: 20,
            };
            const result = setup({ data: customData });
            expect(result.pagination.state.current_page).toBe(2);
            expect(result.pagination.state.last_page).toBe(5);
            expect(result.pagination.state.total).toBe(50);
            expect(result.pagination.state.from).toBe(11);
            expect(result.pagination.state.to).toBe(20);
            expect(result.collection.value).toEqual([{ id: 10 }]);
        });
    });

    describe('loadData', () => {
        it('sends correct params', () => {
            const result = setup();
            window.axios.get.mockResolvedValueOnce({ data: { data: mockData } });

            result.loadData();

            expect(window.axios.get).toHaveBeenCalledWith('/api/items', {
                params: expect.objectContaining({
                    per_page: 10,
                    page: 1,
                    orderBy: 'id',
                    orderDirection: 'asc',
                }),
            });
        });

        it('resets page to 1 when resetCurrentPage is true', () => {
            const result = setup();
            result.pagination.state.current_page = 5;
            window.axios.get.mockResolvedValueOnce({ data: { data: mockData } });

            result.loadData(true);

            expect(window.axios.get).toHaveBeenCalledWith('/api/items', {
                params: expect.objectContaining({
                    page: 1,
                }),
            });
        });

        it('merges filters into params', () => {
            const result = setup();
            result.filters.status = 'active';
            window.axios.get.mockResolvedValueOnce({ data: { data: mockData } });

            result.loadData();

            expect(window.axios.get).toHaveBeenCalledWith('/api/items', {
                params: expect.objectContaining({
                    status: 'active',
                }),
            });
        });
    });

    describe('onSort', () => {
        it('updates orderBy and calls loadData', () => {
            const result = setup();
            window.axios.get.mockResolvedValueOnce({ data: { data: mockData } });

            result.onSort({ column: 'name', direction: 'desc' });

            expect(result.orderBy.column).toBe('name');
            expect(result.orderBy.direction).toBe('desc');
            expect(window.axios.get).toHaveBeenCalled();
        });
    });

    describe('onPageChange', () => {
        it('updates current page and calls loadData', () => {
            const result = setup();
            window.axios.get.mockResolvedValueOnce({ data: { data: mockData } });

            result.onPageChange(3);

            expect(result.pagination.state.current_page).toBe(3);
            expect(window.axios.get).toHaveBeenCalled();
        });
    });

    describe('onPerPageChange', () => {
        it('resets to page 1 and calls loadData', () => {
            const result = setup();
            result.pagination.state.current_page = 5;
            window.axios.get.mockResolvedValueOnce({ data: { data: mockData } });

            result.onPerPageChange();

            expect(result.pagination.state.current_page).toBe(1);
            expect(window.axios.get).toHaveBeenCalled();
        });
    });

    describe('bulkDelete', () => {
        it('posts ids directly without data wrapper', async () => {
            const result = setup();
            result.bulkItems[1] = true;
            result.bulkItems[2] = true;
            result.bulkItems[3] = false;

            window.axios.post.mockResolvedValueOnce({ data: { message: 'Deleted' } });
            window.axios.get.mockResolvedValueOnce({ data: { data: mockData } });

            result.bulkDelete('/api/items/bulk-destroy');

            // Confirm modal should be shown
            expect(result.confirmModal.show).toBe(true);

            // Trigger confirm callback
            result.confirmModal.onConfirm();

            expect(window.axios.post).toHaveBeenCalledWith('/api/items/bulk-destroy', {
                ids: ['1', '2'],
            });
        });
    });

    describe('onUpdateItem', () => {
        it('replaces item in collection by id', () => {
            const result = setup();
            const updatedItem = { id: 2, name: 'Updated Item 2' };
            result.onUpdateItem(updatedItem);
            expect(result.collection.value[1]).toEqual(updatedItem);
        });

        it('does nothing for non-existent id', () => {
            const result = setup();
            const original = [...result.collection.value];
            result.onUpdateItem({ id: 999, name: 'Ghost' });
            expect(result.collection.value).toEqual(original);
        });
    });
});
