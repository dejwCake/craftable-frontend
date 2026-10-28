<template>
    <button
        type="button"
        class="btn btn-sm btn-dark"
        :title="translations.force_delete_btn"
        @click="showConfirm = true"
    >
        <i class="fa fa-eraser"></i>
    </button>

    <ConfirmModal
        :show="showConfirm"
        variant="danger"
        :translations="translations"
        @confirm="onConfirm"
        @cancel="showConfirm = false"
    />
</template>

<script setup>
import { ref } from 'vue';
const axios = window.axios;
import { notifySuccess, notifyError } from '../../utils/notify.js';
import ConfirmModal from '../ConfirmModal.vue';

const props = defineProps({
    url: { type: String, required: true },
    translations: {
        type: Object,
        default: () => ({
            force_delete_btn: 'Delete permanently',
            confirm_title: 'Deletion',
            confirm_text: 'Delete this item permanently? This cannot be undone.',
            confirm_btn: 'Delete permanently',
            cancel_btn: 'Cancel',
        }),
    },
});

const emit = defineEmits(['deleted']);

const showConfirm = ref(false);

function onConfirm() {
    showConfirm.value = false;

    axios.delete(props.url).then(
        (response) => {
            notifySuccess(response.data.message);
            emit('deleted');
        },
        (error) => {
            notifyError(error.response?.data?.message);
        },
    );
}
</script>
