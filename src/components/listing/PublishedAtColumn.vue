<template>
    <span v-if="item.published_at <= now">
      {{ formatDatetime(item.published_at, datetimeFormat) }}
    </span>
    <span v-if="item.published_at > now">
      <small>{{ translations.will_be_published }}</small><br />
      {{ formatDatetime(item.published_at, datetimeFormat) }}
      <span
        class="cursor-pointer"
        @click="openPublishLater()"
        :title="translations.publish_later"
        role="button"
      >
        <i class="fa fa-calendar"></i>
      </span>
    </span>
    <div v-if="!item.published_at">
      <span
        class="btn btn-sm btn-info text-white mb-1"
        @click="openPublishLater()"
        :title="translations.publish_later"
        role="button"
      >
        <i class="fa fa-calendar"></i>&nbsp;&nbsp;{{ translations.publish_later }}
      </span>
    </div>
    <div v-if="!item.published_at || item.published_at > now">
      <form class="d-inline" @submit.prevent="publishNow()">
        <button
          type="submit"
          class="btn btn-sm btn-success text-white"
          :title="translations.publish_now"
          :disabled="submitting"
        >
          <i class="fa fa-paper-plane"></i>&nbsp;&nbsp;{{ translations.publish_now }}
        </button>
      </form>
    </div>
    <div v-if="item.published_at && item.published_at < now">
      <form class="d-inline" @submit.prevent="unpublishNow()">
        <button
          type="submit"
          class="btn btn-sm btn-danger"
          :title="translations.unpublish_now"
          :disabled="submitting"
        >
          <i class="fa fa-paper-plane"></i>&nbsp;&nbsp;{{ translations.unpublish_now }}
        </button>
      </form>
    </div>
    <div v-if="editing" class="publish-later-backdrop" @click.self="editing = false"></div>
    <div v-if="editing" class="publish-later-modal">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>{{ translations.publish_later }}</strong>
        <button type="button" class="btn-close btn-close-sm" @click="editing = false" aria-label="Close"></button>
      </div>
      <VueDatePicker
        v-model="publishDate"
        model-type="yyyy-MM-dd HH:mm:ss"
        :enable-time-picker="true"
        :enable-seconds="true"
        :format="'yyyy-MM-dd HH:mm:ss'"
        :inline="true"
        auto-apply
      />
      <div class="mt-2 text-end">
        <button
          class="btn btn-sm btn-primary text-white"
          @click="savePublishLater()"
          :disabled="submitting || !publishDate"
        >
          Save
        </button>
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import { notify } from '@kyvg/vue3-notification';
// Use the globally configured axios instance (with CSRF token and X-Requested-With header)
const axios = window.axios;
import { formatDatetime } from '../../utils/dateFormatters.js';

const props = defineProps({
  item: { type: Object, required: true },
  now: { type: String, required: true },
  datetimeFormat: { type: String, default: 'DD.MM.YYYY, HH:mm' },
  translations: {
    type: Object,
    default: () => ({
      publish_now: 'Publish now',
      unpublish_now: 'Unpublish now',
      publish_later: 'Publish later',
      will_be_published: 'This item will be published at',
      confirm_publish_now: 'Do you really want to publish this item now?',
      confirm_unpublish_now: 'Do you really want to unpublish this item?',
    }),
  },
});

const editing = ref(false);
const publishDate = ref(null);
const submitting = ref(false);

function openPublishLater() {
  publishDate.value = props.item.published_at || null;
  editing.value = true;
}

function savePublishLater() {
  if (!publishDate.value) return;
  submitting.value = true;

  axios.post(props.item.resource_url, { published_at: publishDate.value }).then(
    (response) => {
      props.item.published_at = response.data.object.published_at;
      editing.value = false;
      notify({
        type: 'success',
        title: 'Success!',
        text: response.data.message || 'Item successfully scheduled.',
      });
    },
    (error) => {
      notify({
        type: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'An error has occured.',
      });
    }
  ).finally(() => {
    submitting.value = false;
  });
}

function publishNow() {
  if (!window.confirm(props.translations.confirm_publish_now)) return;
  submitting.value = true;

  axios.post(props.item.resource_url, { publish_now: true }).then(
    (response) => {
      props.item.published_at = response.data.object.published_at;
      notify({
        type: 'success',
        title: 'Success!',
        text: response.data.message || 'Item successfully published.',
      });
    },
    (error) => {
      notify({
        type: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'An error has occured.',
      });
    }
  ).finally(() => {
    submitting.value = false;
  });
}

function unpublishNow() {
  if (!window.confirm(props.translations.confirm_unpublish_now)) return;
  submitting.value = true;

  axios.post(props.item.resource_url, { unpublish_now: true }).then(
    (response) => {
      props.item.published_at = response.data.object.published_at;
      props.item.published_to = response.data.object.published_to;
      notify({
        type: 'success',
        title: 'Success!',
        text: response.data.message || 'Item successfully unpublished.',
      });
    },
    (error) => {
      notify({
        type: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'An error has occured.',
      });
    }
  ).finally(() => {
    submitting.value = false;
  });
}
</script>
