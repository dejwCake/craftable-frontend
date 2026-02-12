import { ref, reactive, computed, onBeforeUnmount } from 'vue';
import { notify } from '@kyvg/vue3-notification';
import { useCookies } from 'vue3-cookies';
import axios from 'axios';
import { formatDate, formatDatetime, formatTime, nowInTimezone } from '../utils/dateFormatters.js';

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

  const datetimePickerConfig = ref({
    enableTimePicker: true,
    enableSeconds: true,
    format: 'yyyy-MM-dd HH:mm:ss',
    textInput: true,
    locale: null,
    inline: true,
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
        clickedBulkItemsCount.value >= (pagination.state.to - pagination.state.from + 1) &&
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
        notify({
          type: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'An error has occured.',
        });
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

  function bulkDelete(url, trans) {
    const itemsToDelete = Object.keys(bulkItems).filter((key) => bulkItems[key]);
    const defaultTrans = {
      title: 'Warning!',
      text: `Do you really want to delete ${clickedBulkItemsCount.value} selected items ?`,
      yes: 'Yes, delete.',
      no: 'No, cancel.',
    };
    const t = trans || defaultTrans;

    if (!window.confirm(t.text || defaultTrans.text)) return;

    axios
      .post(url, {
        data: {
          ids: itemsToDelete,
        },
      })
      .then((response) => {
        Object.keys(bulkItems).forEach((key) => delete bulkItems[key]);
        loadData();
        notify({
          type: 'success',
          title: 'Success!',
          text: response.data.message || 'Item successfully deleted.',
        });
      })
      .catch((error) => {
        notify({
          type: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'An error has occured.',
        });
      });
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

    axios.get(props.url, options).then(
      (response) => populateCurrentStateAndData(response.data.data),
      () => {
        // TODO handle error
      }
    );
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

  function deleteItem(url, trans) {
    const defaultTrans = {
      title: 'Warning!',
      text: 'Do you really want to delete this item?',
      yes: 'Yes, delete.',
      no: 'No, cancel.',
    };
    const t = trans || defaultTrans;

    if (!window.confirm(t.text || defaultTrans.text)) return;

    axios.delete(url).then(
      (response) => {
        loadData();
        notify({
          type: 'success',
          title: 'Success!',
          text: response.data.message || 'Item successfully deleted.',
        });
      },
      (error) => {
        notify({
          type: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'An error has occured.',
        });
      }
    );
  }

  function toggleSwitch(url, col, row) {
    axios.post(url, row).then(
      (response) => {
        notify({
          type: 'success',
          title: 'Success!',
          text: response.data.message || 'Item successfully changed.',
        });
      },
      (error) => {
        row[col] = !row[col];
        notify({
          type: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'An error has occured.',
        });
      }
    );
  }

  function publishNow(url, row, trans) {
    const defaultTrans = {
      title: 'Warning!',
      text: 'Do you really want to publish this item now?',
      yes: 'Yes, publish.',
      no: 'No, cancel.',
    };
    const t = trans || defaultTrans;

    if (!window.confirm(t.text || defaultTrans.text)) return;

    axios.post(url, { publish_now: true }).then(
      (response) => {
        row.published_at = response.data.object.published_at;
        notify({
          type: 'success',
          title: 'Success!',
          text: response.data.message || t.success || 'Item successfully published.',
        });
      },
      (error) => {
        notify({
          type: 'error',
          title: 'Error!',
          text: error.response?.data?.message || t.error || 'An error has occured.',
        });
      }
    );
  }

  function unpublishNow(url, row, trans, additionalWarning) {
    const defaultTrans = {
      title: 'Warning!',
      text: 'Do you really want to unpublish this item?',
      yes: 'Yes, unpublish.',
      no: 'No, cancel.',
    };
    const t = trans || defaultTrans;

    const confirmText = additionalWarning ? t.text + '\n' + additionalWarning : t.text;
    if (!window.confirm(confirmText)) return;

    axios.post(url, { unpublish_now: true }).then(
      (response) => {
        row.published_at = response.data.object.published_at;
        row.published_to = response.data.object.published_to;
        notify({
          type: 'success',
          title: 'Success!',
          text: response.data.message || t.success || 'Item successfully unpublished.',
        });
      },
      (error) => {
        notify({
          type: 'error',
          title: 'Error!',
          text: error.response?.data?.message || t.error || 'An error has occured.',
        });
      }
    );
  }

  function publishLater(url, row, trans) {
    const publishedAt = window.prompt(
      trans?.text || 'Enter publish date (YYYY-MM-DD HH:mm:ss):',
      row.published_at || ''
    );
    if (publishedAt === null) return;

    axios.post(url, { published_at: publishedAt }).then(
      (response) => {
        row.published_at = response.data.object.published_at;
        notify({
          type: 'success',
          title: 'Success!',
          text: response.data.message || trans?.success || 'Item successfully scheduled.',
        });
      },
      (error) => {
        notify({
          type: 'error',
          title: 'Error!',
          text: error.response?.data?.message || trans?.error || 'An error has occured.',
        });
      }
    );
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
    datetimePickerConfig,

    // Computed
    isClickedAll,
    clickedBulkItemsCount,

    // Methods
    allClickedItemsAreSame,
    onBulkItemClicked,
    onBulkItemsClickedAll,
    onBulkItemsClickedAllWithPagination,
    checkAllItems,
    onBulkItemsClickedAllUncheck,
    bulkDelete,
    loadData,
    filter,
    populateCurrentStateAndData,
    deleteItem,
    toggleSwitch,
    publishNow,
    unpublishNow,
    publishLater,

    // Date formatters (convenience re-exports)
    formatDate,
    formatDatetime,
    formatTime,
  };
}
