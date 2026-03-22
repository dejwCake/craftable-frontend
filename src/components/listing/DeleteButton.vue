<template>
    <button type="button" class="btn btn-sm btn-danger" :title="translations.delete_btn" @click="showConfirm = true">
        <i class="fa fa-trash"></i>
    </button>

    <ConfirmModal :show="showConfirm" :translations="translations" @confirm="onConfirm" @cancel="showConfirm = false" />
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
            delete_btn: 'Delete',
            confirm_title: 'Warning!',
            confirm_text: 'Do you really want to delete this item?',
            confirm_btn: 'Delete',
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
