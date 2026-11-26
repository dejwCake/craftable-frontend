<template>
    <button
        type="button"
        class="btn btn-sm btn-info security-reset-btn"
        :title="translations.reset_btn"
        :aria-label="translations.reset_btn"
        @click="open"
    >
        <i class="fa fa-shield"></i>
    </button>

    <Teleport to="body">
        <div v-if="show" class="modal-backdrop fade show" @click="close"></div>
        <div v-if="show" class="modal fade show d-block" tabindex="-1" role="dialog" @click.self="close">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <form class="modal-content security-reset-form" novalidate @submit.prevent="submit">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fa fa-triangle-exclamation text-warning me-2"></i>
                            {{ translations.confirm_title }}
                        </h5>
                        <button
                            type="button"
                            class="btn-close"
                            :aria-label="translations.cancel_btn"
                            @click="close"
                        ></button>
                    </div>
                    <div class="modal-body">
                        <p>{{ translations.confirm_text }}</p>
                        <label for="security_reset_current_password" class="form-label">
                            {{ translations.current_password }}
                        </label>
                        <input
                            id="security_reset_current_password"
                            v-model="currentPassword"
                            type="password"
                            name="current_password"
                            class="form-control"
                            :class="{ 'is-invalid': error }"
                            autocomplete="current-password"
                        />
                        <div v-if="error" class="invalid-feedback">{{ error }}</div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary security-reset-cancel" @click="close">
                            {{ translations.cancel_btn }}
                        </button>
                        <button type="submit" class="btn btn-danger security-reset-confirm" :disabled="submitting">
                            <i v-if="submitting" class="fa fa-spinner fa-spin"></i>
                            {{ translations.confirm_btn }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { notifyError, notifySuccess } from '@dejwcake/craftable';

const props = defineProps({
    url: { type: String, required: true },
    translations: {
        type: Object,
        default: () => ({
            reset_btn: 'Reset two-factor',
            confirm_title: 'Reset two-factor authentication?',
            confirm_text: "This removes the admin's authenticator app, recovery codes and passkeys.",
            current_password: 'Your password',
            confirm_btn: 'Reset',
            cancel_btn: 'Cancel',
        }),
    },
});

const emit = defineEmits(['reset']);

const axios = window.axios;
const show = ref(false);
const currentPassword = ref('');
const error = ref('');
const submitting = ref(false);

function open() {
    currentPassword.value = '';
    error.value = '';
    show.value = true;
}

function close() {
    show.value = false;
}

async function submit() {
    submitting.value = true;
    error.value = '';
    try {
        const { data } = await axios.post(props.url, { current_password: currentPassword.value });
        show.value = false;
        notifySuccess(data.message);
        emit('reset');
    } catch (exception) {
        const data = exception.response?.data || {};
        const errors = data.errors || {};
        // Field errors stay in the modal; anything else (e.g. 403) closes it with a notification.
        const fieldError = errors.current_password?.[0] || errors.admin_user?.[0];
        if (fieldError) {
            error.value = fieldError;
        } else {
            show.value = false;
            notifyError(data.message);
        }
    } finally {
        submitting.value = false;
    }
}
</script>
