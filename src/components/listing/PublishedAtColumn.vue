<template>
    <span v-if="item.published_at <= now">
        {{ formatDatetime(item.published_at, datetimeFormat) }}
    </span>
    <span v-if="item.published_at > now">
        <small>{{ translations.will_be_published }}</small
        ><br />
        {{ formatDatetime(item.published_at, datetimeFormat) }}
        <span class="cursor-pointer" :title="translations.publish_later" role="button" @click="openPublishLater()">
            <i class="fa fa-calendar"></i>
        </span>
    </span>
    <div v-if="!item.published_at">
        <span
            class="btn btn-sm btn-info text-white mb-1"
            :title="translations.publish_later"
            role="button"
            @click="openPublishLater()"
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
            <button type="button" class="btn-close btn-close-sm" aria-label="Close" @click="editing = false"></button>
        </div>
        <VueDatePicker
            v-model="publishDate"
            model-type="yyyy-MM-dd HH:mm:ss"
            :format="'dd.MM.yyyy HH:mm'"
            :format-locale="dateFnsLocale"
            :enable-time-picker="true"
            :enable-seconds="false"
            :inline="true"
            auto-apply
        />
        <div class="mt-2 text-end">
            <button
                class="btn btn-sm btn-primary text-white"
                :disabled="submitting || !publishDate"
                @click="savePublishLater()"
            >
                Save
            </button>
        </div>
    </div>
    <ConfirmModal
        :show="showConfirm"
        :translations="confirmTranslations"
        :variant="confirmVariant"
        @confirm="onConfirm"
        @cancel="onCancelConfirm"
    />
</template>

<script setup>
import { ref } from 'vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import { notifySuccess, notifyError } from '../../utils/notify.js';
// Use the globally configured axios instance (with CSRF token and X-Requested-With header)
const axios = window.axios;
import { formatDatetime } from '../../utils/dateFormatters.js';
import { getDateFnsLocale } from '../../utils/dateFnsLocale.js';
import ConfirmModal from '../ConfirmModal.vue';

const dateFnsLocale = getDateFnsLocale();

const props = defineProps({
    item: { type: Object, required: true },
    url: { type: String, required: true },
    now: { type: String, required: true },
    datetimeFormat: { type: String, default: 'DD.MM.YYYY HH:mm' },
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

const emit = defineEmits(['update:item']);

const editing = ref(false);
const publishDate = ref(null);
const submitting = ref(false);
const showConfirm = ref(false);
const pendingAction = ref(null);
const confirmTranslations = ref({});
const confirmVariant = ref('danger');

function openPublishLater() {
    publishDate.value = props.item.published_at || null;
    editing.value = true;
}

function savePublishLater() {
    if (!publishDate.value) return;
    submitting.value = true;

    axios
        .post(props.url, { published_at: publishDate.value })
        .then(
            (response) => {
                emit('update:item', { ...props.item, published_at: response.data.object.published_at });
                editing.value = false;
                notifySuccess(response.data.message);
            },
            (error) => {
                notifyError(error.response?.data?.message);
            },
        )
        .finally(() => {
            submitting.value = false;
        });
}

function publishNow() {
    pendingAction.value = 'publish';
    confirmVariant.value = 'success';
    confirmTranslations.value = {
        confirm_title: props.translations.publish_now,
        confirm_text: props.translations.confirm_publish_now,
        confirm_btn: props.translations.publish_now,
        cancel_btn: 'Cancel',
    };
    showConfirm.value = true;
}

function unpublishNow() {
    pendingAction.value = 'unpublish';
    confirmVariant.value = 'danger';
    confirmTranslations.value = {
        confirm_title: props.translations.unpublish_now,
        confirm_text: props.translations.confirm_unpublish_now,
        confirm_btn: props.translations.unpublish_now,
        cancel_btn: 'Cancel',
    };
    showConfirm.value = true;
}

function onConfirm() {
    showConfirm.value = false;
    if (pendingAction.value === 'publish') {
        doPublishNow();
    } else if (pendingAction.value === 'unpublish') {
        doUnpublishNow();
    }
    pendingAction.value = null;
}

function onCancelConfirm() {
    showConfirm.value = false;
    pendingAction.value = null;
}

function doPublishNow() {
    submitting.value = true;
    axios
        .post(props.url, { publish_now: true })
        .then(
            (response) => {
                emit('update:item', { ...props.item, published_at: response.data.object.published_at });
                notifySuccess(response.data.message);
            },
            (error) => {
                notifyError(error.response?.data?.message);
            },
        )
        .finally(() => {
            submitting.value = false;
        });
}

function doUnpublishNow() {
    submitting.value = true;
    axios
        .post(props.url, { unpublish_now: true })
        .then(
            (response) => {
                emit('update:item', {
                    ...props.item,
                    published_at: response.data.object.published_at,
                    published_to: response.data.object.published_to,
                });
                notifySuccess(response.data.message);
            },
            (error) => {
                notifyError(error.response?.data?.message);
            },
        )
        .finally(() => {
            submitting.value = false;
        });
}
</script>
