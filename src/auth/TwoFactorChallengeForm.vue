<template>
    <div class="card">
        <div class="card-body">
            <form role="form" method="POST" :action="action" novalidate @submit.prevent="onSubmit">
                <div class="auth-header">
                    <h1 class="auth-title">{{ translations.title }}</h1>
                    <p class="auth-subtitle">
                        {{ subtitle }}
                    </p>
                </div>
                <div class="auth-body">
                    <div v-if="hasPasskeys" class="mb-3 passkey-option">
                        <button
                            v-if="passkeySupported"
                            type="button"
                            class="btn btn-primary w-100 passkey-btn"
                            :disabled="passkeySubmitting"
                            @click="verifyWithPasskey"
                        >
                            <i class="fa" :class="passkeySubmitting ? 'fa-spinner fa-spin' : 'fa-fingerprint'"></i>
                            {{ translations.usePasskey }}
                        </button>
                        <div v-else class="alert alert-info passkey-unsupported">
                            {{ translations.passkeyUnsupported }}
                        </div>
                        <div v-if="passkeyError" class="invalid-feedback d-block form-text passkey-error">
                            {{ passkeyError }}
                        </div>
                        <p v-if="hasTotp" class="text-center text-body-secondary mt-3 mb-0 passkey-or">
                            {{ translations.or }}
                        </p>
                    </div>

                    <template v-if="hasTotp">
                        <div v-if="useRecoveryCode" class="mb-3">
                            <label for="recovery_code">{{ translations.recoveryCode }}</label>
                            <div class="input-group input-group--custom">
                                <span class="input-group-text"><i class="fa fa-life-ring"></i></span>
                                <input
                                    id="recovery_code"
                                    v-model="form.recovery_code"
                                    type="text"
                                    class="form-control"
                                    :class="{ 'is-invalid': errors.recovery_code }"
                                    name="recovery_code"
                                    autocomplete="off"
                                    :placeholder="translations.recoveryCode"
                                />
                            </div>
                            <div v-if="errors.recovery_code" class="invalid-feedback d-block form-text">
                                {{ errors.recovery_code }}
                            </div>
                        </div>

                        <div v-else class="mb-3">
                            <label for="code">{{ translations.code }}</label>
                            <div class="input-group input-group--custom">
                                <span class="input-group-text"><i class="fa fa-mobile-screen"></i></span>
                                <input
                                    id="code"
                                    v-model="form.code"
                                    type="text"
                                    class="form-control"
                                    :class="{ 'is-invalid': errors.code }"
                                    name="code"
                                    autocomplete="one-time-code"
                                    inputmode="numeric"
                                    :placeholder="translations.code"
                                />
                            </div>
                            <div v-if="errors.code" class="invalid-feedback d-block form-text">
                                {{ errors.code }}
                            </div>
                        </div>

                        <div class="mb-3">
                            <button type="submit" class="btn btn-primary submit-btn" :disabled="submitting">
                                <i v-if="submitting" class="fa fa-spinner fa-spin"></i>
                                {{ translations.button }}
                            </button>
                        </div>
                        <div class="mb-3 text-center">
                            <button type="button" class="btn btn-link auth-ghost-link toggle-link" @click="toggle">
                                {{ useRecoveryCode ? translations.useCode : translations.useRecoveryCode }}
                            </button>
                        </div>
                    </template>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useBaseAuth } from '@dejwcake/craftable';
import { usePasskeys } from '@craftable/composables/usePasskeys.js';

const props = defineProps({
    action: { type: String, required: true },
    redirectUrl: { type: String, default: '/admin' },
    translations: { type: Object, default: () => ({}) },
    hasTotp: { type: Boolean, default: true },
    hasPasskeys: { type: Boolean, default: false },
    passkeyOptionsUrl: { type: String, default: '' },
    passkeyUrl: { type: String, default: '' },
});

const useRecoveryCode = ref(false);

const subtitle = computed(() => {
    if (!props.hasTotp) {
        return props.translations.passkeyText;
    }
    if (useRecoveryCode.value) {
        return props.translations.recoveryCodeText;
    }

    // A view published before `codeOrPasskeyText` existed falls back to the code text.
    return props.hasPasskeys
        ? props.translations.codeOrPasskeyText || props.translations.codeText
        : props.translations.codeText;
});
// useBaseAuth reads the schema on each submit, so toggling swaps the validated field.
const validationSchema = { code: 'required' };

const { form, errors, submitting, onSubmit, setErrors } = useBaseAuth(props, {
    formDefaults: { code: '', recovery_code: '' },
    validationSchema,
    onSuccess(data) {
        window.location.replace(data.redirect || props.redirectUrl);
    },
});

const axios = window.axios;
const { isSupported, authenticate, isCancelled } = usePasskeys();
const passkeySupported = props.hasPasskeys && isSupported();
const passkeySubmitting = ref(false);
const passkeyError = ref('');

async function verifyWithPasskey() {
    passkeyError.value = '';
    passkeySubmitting.value = true;
    try {
        const credential = await authenticate(props.passkeyOptionsUrl);
        const { data } = await axios.post(props.passkeyUrl, { credential });
        window.location.replace(data?.redirect || props.redirectUrl);
    } catch (error) {
        if (!isCancelled(error)) {
            const data = error?.response?.data || {};
            passkeyError.value = data.errors?.passkey?.[0] || data.message || '';
        }
    } finally {
        passkeySubmitting.value = false;
    }
}

function toggle() {
    useRecoveryCode.value = !useRecoveryCode.value;
    form.value = { code: '', recovery_code: '' };
    setErrors({ code: undefined, recovery_code: undefined });
    delete validationSchema.code;
    delete validationSchema.recovery_code;
    validationSchema[useRecoveryCode.value ? 'recovery_code' : 'code'] = 'required';
}
</script>

<style scoped>
.toggle-link {
    text-decoration: none;
}
</style>
