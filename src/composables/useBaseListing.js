import { ref, reactive, computed, onBeforeUnmount } from 'vue';
import { useCookies } from 'vue3-cookies';
const axios = window.axios;
import { formatDate, formatDatetime, formatTime, nowInTimezone } from '../utils/dateFormatters.js';
import { notifySuccess, notifyError } from '../utils/notify.js';

export function useBaseListing(props) {
    const { cookies } = useCookies();

    const pagination = reactive({
        state: {
            per_page: cookies.get('per_page') || 10,
            current_page: 1,
            last_page: 1,
            from: 1,
            to: 10,
        },
        options: {
            alwaysShowPrevNext: true,
        },
    });

    const orderBy = reactive({
        column: 'id',
        direction: 'asc',
    });

    const filters = reactive({});
    const search = ref('');
    const collection = ref(null);
    const now = ref(nowInTimezone(props.timezone || 'UTC'));
    const bulkItems = reactive({});
    const bulkCheckingAllLoader = ref(false);

    const confirmModal = reactive({
        show: false,
        onConfirm: null,
        translations: {
            confirm_title: 'Warning!',
            confirm_text: 'Are you sure?',
            confirm_btn: 'Yes, confirm',
            cancel_btn: 'Cancel',
        },
    });

    // Update "now" every second
    const nowInterval = setInterval(() => {
        now.value = nowInTimezone(props.timezone || 'UTC');
    }, 1000);

    onBeforeUnmount(() => {
        clearInterval(nowInterval);
    });

    // Computed
    const clickedBulkItemsCount = computed(() => {
        return Object.values(bulkItems).filter((item) => item === true).length;
    });

    const isClickedAll = computed({
        get() {
            return (
                clickedBulkItemsCount.value >= pagination.state.to - pagination.state.from + 1 &&
                clickedBulkItemsCount.value > 0 &&
                allClickedItemsAreSame()
            );
        },
        set() {},
    });

    // Init
    if (props.data != null) {
        populateCurrentStateAndData(props.data);
    } else {
        loadData();
    }

    // Methods
    function allClickedItemsAreSame() {
        if (!collection.value) return false;
        const itemsInPaginationIds = Object.values(collection.value).map(({ id }) => id);

        for (let i = 0; i < itemsInPaginationIds.length; i++) {
            const itemInPaginationId = itemsInPaginationIds[i];
            if (bulkItems[itemInPaginationId] === undefined || bulkItems[itemInPaginationId] === false) {
                return false;
            }
        }

        return true;
    }

    function onBulkItemClicked(id) {
        if (bulkItems[id] === undefined) {
            bulkItems[id] = true;
        } else {
            bulkItems[id] = !bulkItems[id];
        }
    }

    function onBulkItemsClickedAll(url) {
        const options = {
            params: {
                bulk: true,
            },
        };

        bulkCheckingAllLoader.value = true;
        Object.assign(options.params, filters);

        axios
            .get(url, options)
            .then((response) => {
                checkAllItems(response.data.bulkItems);
            })
            .catch((error) => {
                notifyError(error.response?.data?.message);
            })
            .finally(() => {
                bulkCheckingAllLoader.value = false;
            });
    }

    function onBulkItemsClickedAllWithPagination() {
        if (!collection.value) return;
        const itemsInPagination = Object.values(collection.value).map(({ id }) => id);
        if (!isClickedAll.value) {
            bulkCheckingAllLoader.value = true;
            checkAllItems(itemsInPagination);
            bulkCheckingAllLoader.value = false;
        } else {
            onBulkItemsClickedAllUncheck(itemsInPagination);
        }
    }

    function checkAllItems(itemsToCheck) {
        itemsToCheck.forEach((itemId) => {
            bulkItems[itemId] = true;
        });
    }

    function onBulkItemsClickedAllUncheck(bulkItemsToUncheck = null) {
        if (bulkItemsToUncheck === null) {
            Object.keys(bulkItems).forEach((key) => delete bulkItems[key]);
        } else {
            if (!collection.value) return;
            Object.values(collection.value)
                .map(({ id }) => id)
                .forEach((itemId) => {
                    bulkItems[itemId] = false;
                });
        }
    }

    function bulkDelete(url, trans = {}) {
        const itemsToDelete = Object.keys(bulkItems).filter((key) => bulkItems[key]);

        confirmModal.translations = {
            ...confirmModal.translations,
            ...trans,
            confirm_text: (trans.confirm_text || 'Do you really want to delete :number selected items?').replace(
                ':number',
                clickedBulkItemsCount.value,
            ),
        };
        confirmModal.onConfirm = () => {
            confirmModal.show = false;
            axios
                .post(url, {
                    ids: itemsToDelete,
                })
                .then((response) => {
                    Object.keys(bulkItems).forEach((key) => delete bulkItems[key]);
                    loadData();
                    notifySuccess(response.data.message);
                })
                .catch((error) => {
                    notifyError(error.response?.data?.message);
                });
        };
        confirmModal.show = true;
    }

    function loadData(resetCurrentPage) {
        const options = {
            params: {
                per_page: pagination.state.per_page,
                page: pagination.state.current_page,
                orderBy: orderBy.column,
                orderDirection: orderBy.direction,
            },
        };

        if (resetCurrentPage === true) {
            options.params.page = 1;
        }

        Object.assign(options.params, filters);

        axios
            .get(props.url, options)
            .then((response) => {
                populateCurrentStateAndData(response.data.data);
            })
            .catch((error) => {
                notifyError(error.response?.data?.message);
            });
    }

    function filter(column, value) {
        if (value === '') {
            delete filters[column];
        } else {
            filters[column] = value;
        }
        loadData(true);
    }

    function populateCurrentStateAndData(object) {
        if (object.current_page > object.last_page && object.total > 0) {
            pagination.state.current_page = object.last_page;
            loadData();
            return;
        }

        collection.value = object.data;
        pagination.state.current_page = object.current_page;
        pagination.state.last_page = object.last_page;
        pagination.state.total = object.total;
        pagination.state.per_page = object.per_page;
        pagination.state.to = object.to;
        pagination.state.from = object.from;
    }

    function getAction(url) {
        return axios
            .get(url)
            .then((response) => {
                if (response.data.message) {
                    notifySuccess(response.data.message);
                } else if (response.data.redirect) {
                    window.location.replace(response.data.redirect);
                } else if (response.data.data?.path) {
                    window.location.replace(response.data.data.path);
                }
            })
            .catch((error) => {
                notifyError(error.response?.data?.message);
            });
    }

    function resolveUrl(template, item) {
        return template.replace(':id', item.id);
    }

    function onSort({ column, direction }) {
        orderBy.column = column;
        orderBy.direction = direction;
        loadData();
    }

    function onPageChange(page) {
        pagination.state.current_page = page;
        loadData();
    }

    function onPerPageChange() {
        pagination.state.current_page = 1;
        loadData(true);
    }

    function onUpdateItem(updatedItem) {
        if (!collection.value) return;
        const index = collection.value.findIndex((item) => item.id === updatedItem.id);
        if (index !== -1) {
            collection.value[index] = updatedItem;
        }
    }

    return {
        // State
        pagination,
        orderBy,
        filters,
        search,
        collection,
        now,
        bulkItems,
        bulkCheckingAllLoader,
        confirmModal,

        // Computed
        isClickedAll,
        clickedBulkItemsCount,

        // Methods
        onBulkItemClicked,
        onBulkItemsClickedAll,
        onBulkItemsClickedAllWithPagination,
        onBulkItemsClickedAllUncheck,
        bulkDelete,
        loadData,
        filter,
        resolveUrl,
        getAction,
        onSort,
        onPageChange,
        onPerPageChange,
        onUpdateItem,

        // Date formatters (convenience re-exports)
        formatDate,
        formatDatetime,
        formatTime,
    };
}
