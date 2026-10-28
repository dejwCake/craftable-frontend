<template>
    <span :title="disabled ? translations.not_restorable : translations.restore_btn">
        <button
            type="button"
            class="btn btn-sm btn-success text-white"
            :disabled="disabled"
            @click="showConfirm = true"
        >
            <i class="fa fa-trash-arrow-up"></i>
        </button>
    </span>

    <ConfirmModal
        :show="showConfirm"
        variant="success"
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
    disabled: { type: Boolean, default: false },
    translations: {
        type: Object,
        default: () => ({
            restore_btn: 'Restore',
            not_restorable: 'This item cannot be restored, an item it belongs to is deleted.',
            confirm_title: 'Restore',
            confirm_text: 'Do you really want to restore this item?',
            confirm_btn: 'Restore',
            cancel_btn: 'Cancel',
        }),
    },
});

const emit = defineEmits(['restored']);

const showConfirm = ref(false);

function onConfirm() {
    showConfirm.value = false;

    axios.post(props.url).then(
        (response) => {
            notifySuccess(response.data.message);
            emit('restored');
        },
        (error) => {
            notifyError(error.response?.data?.message);
        },
    );
}
</script>
