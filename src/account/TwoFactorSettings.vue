<template>
    <div class="card">
        <div class="card-header"><i class="fa fa-shield-halved"></i> {{ translations.title }}</div>

        <div class="card-body">
            <div v-if="generalError" class="alert alert-danger">{{ generalError }}</div>

            <template v-if="state === 'off'">
                <p class="two-factor-status">
                    <span class="badge bg-secondary">{{ translations.status_off }}</span>
                </p>
                <p>{{ translations.enable_description }}</p>
                <button type="button" class="btn btn-primary two-factor-enable" :disabled="submitting" @click="enable">
                    <i v-if="submitting" class="fa fa-spinner fa-spin"></i>
                    {{ translations.enable }}
                </button>
            </template>

            <form v-else-if="state === 'enrolling'" novalidate @submit.prevent="confirm">
                <p>{{ translations.scan_qr }}</p>
                <!-- eslint-disable-next-line vue/no-v-html -- SVG rendered by the server from the otpauth URI -->
                <div class="two-factor-qr mb-3" v-html="qrCode"></div>
                <p>
                    {{ translations.secret_label }}
                    <code class="two-factor-secret">{{ secret }}</code>
                </p>

                <div class="mb-3 row align-items-center">
                    <label for="code" class="col-md-3 col-form-label text-md-end">{{ translations.code }}</label>
                    <div class="col-md-9 col-xl-8">
                        <input
                            id="code"
                            v-model="form.code"
                            type="text"
                            name="code"
                            class="form-control"
                            :class="{ 'is-invalid': errors.code }"
                            autocomplete="one-time-code"
                            inputmode="numeric"
                        />
                        <div v-if="errors.code" class="invalid-feedback form-text">{{ errors.code }}</div>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary two-factor-confirm" :disabled="submitting">
                    <i v-if="submitting" class="fa fa-spinner fa-spin"></i>
                    {{ translations.confirm }}
                </button>
                <button type="button" class="btn btn-link two-factor-cancel" @click="cancel">
                    {{ translations.cancel }}
                </button>
            </form>

            <template v-else-if="state === 'codes'">
                <h5>{{ translations.recovery_codes_title }}</h5>
                <p>{{ translations.recovery_codes_description }}</p>
                <ul class="two-factor-recovery-codes list-unstyled font-monospace">
                    <li v-for="recoveryCode in recoveryCodes" :key="recoveryCode">{{ recoveryCode }}</li>
                </ul>
                <button type="button" class="btn btn-outline-secondary me-2 two-factor-copy" @click="copyCodes">
                    <i class="fa fa-copy"></i> {{ copied ? translations.copied : translations.copy }}
                </button>
                <button type="button" class="btn btn-outline-secondary me-2 two-factor-download" @click="downloadCodes">
                    <i class="fa fa-download"></i> {{ translations.download }}
                </button>
                <button type="button" class="btn btn-primary two-factor-done" @click="state = 'on'">
                    {{ translations.done }}
                </button>
            </template>

            <form v-else novalidate @submit.prevent>
                <p class="two-factor-status">
                    <span class="badge bg-success">{{ translations.status_on }}</span>
                </p>
                <p v-if="required" class="text-body-secondary two-factor-required">
                    {{ translations.required_notice }}
                </p>

                <FormInput
                    v-model="form.current_password"
                    name="current_password"
                    type="password"
                    :label="translations.current_password"
                    :error="errors.current_password"
                />

                <button
                    type="button"
                    class="btn btn-outline-primary me-2 two-factor-regenerate"
                    :disabled="submitting"
                    @click="regenerate"
                >
                    {{ translations.regenerate }}
                </button>
                <button
                    v-if="!required"
                    type="button"
                    class="btn btn-danger two-factor-disable"
                    :disabled="submitting"
                    @click="disable"
                >
                    {{ translations.disable }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { FormInput, notifySuccess } from '@dejwcake/craftable';

const props = defineProps({
    enabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    enableUrl: { type: String, required: true },
    confirmUrl: { type: String, required: true },
    recoveryCodesUrl: { type: String, required: true },
    disableUrl: { type: String, required: true },
    translations: { type: Object, default: () => ({}) },
});

const axios = window.axios;

// off → enrolling → codes → on; regenerating goes on → codes, disabling on → off
const state = ref(props.enabled ? 'on' : 'off');
const submitting = ref(false);
const form = ref({ code: '', current_password: '' });
const errors = ref({});
const generalError = ref('');
const secret = ref('');
const qrCode = ref('');
const recoveryCodes = ref([]);
const copied = ref(false);

function send(request) {
    submitting.value = true;
    errors.value = {};
    generalError.value = '';

    return request()
        .then((response) => response.data || {})
        .catch((error) => {
            const data = error.response?.data || {};
            if (data.errors) {
                errors.value = Object.fromEntries(Object.entries(data.errors).map(([key, value]) => [key, value[0]]));
            } else {
                generalError.value = data.message || '';
            }

            return null;
        })
        .finally(() => {
            submitting.value = false;
        });
}

async function enable() {
    const data = await send(() => axios.post(props.enableUrl));
    if (data) {
        secret.value = data.secret;
        qrCode.value = data.qr_code;
        form.value.code = '';
        state.value = 'enrolling';
    }
}

async function confirm() {
    const data = await send(() => axios.post(props.confirmUrl, { code: form.value.code }));
    if (data) {
        showRecoveryCodes(data.recovery_codes);
    }
}

function cancel() {
    errors.value = {};
    state.value = 'off';
}

async function regenerate() {
    const data = await send(() =>
        axios.post(props.recoveryCodesUrl, { current_password: form.value.current_password }),
    );
    if (data) {
        form.value.current_password = '';
        showRecoveryCodes(data.recovery_codes);
    }
}

async function disable() {
    const data = await send(() =>
        axios.delete(props.disableUrl, { data: { current_password: form.value.current_password } }),
    );
    if (data) {
        form.value.current_password = '';
        state.value = 'off';
        notifySuccess(data.message);
    }
}

function showRecoveryCodes(codes) {
    recoveryCodes.value = codes || [];
    copied.value = false;
    state.value = 'codes';
}

function codesAsText() {
    return `${recoveryCodes.value.join('\n')}\n`;
}

async function copyCodes() {
    await navigator.clipboard.writeText(codesAsText());
    copied.value = true;
}

function downloadCodes() {
    const url = URL.createObjectURL(new Blob([codesAsText()], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recovery-codes.txt';
    link.click();
    URL.revokeObjectURL(url);
}
</script>

<style scoped>
.two-factor-qr :deep(svg) {
    max-width: 200px;
    height: auto;
}
</style>
