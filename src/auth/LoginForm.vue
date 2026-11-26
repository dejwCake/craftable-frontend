<template>
    <div class="card">
        <div class="card-body">
            <form role="form" method="POST" :action="action" novalidate @submit.prevent="onSubmit">
                <div class="auth-header">
                    <h1 class="auth-title">{{ translations.title }}</h1>
                    <p class="auth-subtitle">{{ translations.signInText }}</p>
                </div>
                <div class="auth-body">
                    <div v-if="statusMessage" class="alert alert-success">
                        {{ statusMessage }}
                    </div>
                    <div v-if="serverErrors.length" class="alert alert-danger">
                        <ul>
                            <li v-for="(error, index) in serverErrors" :key="index">{{ error }}</li>
                        </ul>
                    </div>

                    <div class="mb-3">
                        <label for="email">{{ translations.email }}</label>
                        <div class="input-group input-group--custom">
                            <span class="input-group-text"><i class="fa fa-envelope"></i></span>
                            <input
                                id="email"
                                v-model="form.email"
                                type="text"
                                class="form-control"
                                :class="{ 'is-invalid': errors.email }"
                                name="email"
                                :autocomplete="passkeysEnabled ? 'username webauthn' : undefined"
                                :placeholder="translations.email"
                            />
                        </div>
                        <div v-if="errors.email" class="invalid-feedback d-block form-text">
                            {{ errors.email }}
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="password">{{ translations.password }}</label>
                        <div class="input-group input-group--custom">
                            <span class="input-group-text"><i class="fa fa-lock"></i></span>
                            <input
                                id="password"
                                v-model="form.password"
                                type="password"
                                class="form-control"
                                :class="{ 'is-invalid': errors.password }"
                                name="password"
                                :placeholder="translations.password"
                            />
                        </div>
                        <div v-if="errors.password" class="invalid-feedback d-block form-text">
                            {{ errors.password }}
                        </div>
                    </div>

                    <div class="mb-3">
                        <input type="hidden" name="remember" value="1" />
                        <button type="submit" class="btn btn-primary submit-btn" :disabled="submitting">
                            <i v-if="submitting" class="fa fa-spinner fa-spin"></i>
                            {{ translations.button }}
                        </button>
                    </div>
                    <div v-if="passkeysEnabled" class="mb-3">
                        <button
                            type="button"
                            class="btn btn-outline-primary passkey-btn"
                            :disabled="passkeySubmitting"
                            @click="signInWithPasskey"
                        >
                            <i class="fa" :class="passkeySubmitting ? 'fa-spinner fa-spin' : 'fa-fingerprint'"></i>
                            {{ translations.passkeyButton }}
                        </button>
                        <div v-if="passkeyError" class="invalid-feedback d-block form-text passkey-error">
                            {{ passkeyError }}
                        </div>
                    </div>
                    <div class="mb-3 text-center">
                        <a :href="passwordResetUrl" class="auth-ghost-link forgot-link">{{
                            translations.forgotPassword
                        }}</a>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useBaseAuth } from '@dejwcake/craftable';
import { usePasskeys } from '@craftable/composables/usePasskeys.js';

const props = defineProps({
    action: { type: String, required: true },
    redirectUrl: { type: String, default: '/admin' },
    translations: { type: Object, default: () => ({}) },
    passwordResetUrl: { type: String, default: '/admin/password-reset' },
    statusMessage: { type: String, default: '' },
    serverErrors: { type: Array, default: () => [] },
    // Both set (admin-auth passes them once the passkeys table exists) to offer passkeys.
    passkeyOptionsUrl: { type: String, default: '' },
    passkeyLoginUrl: { type: String, default: '' },
});

const { form, errors, submitting, onSubmit } = useBaseAuth(props, {
    formDefaults: { email: '', password: '' },
    validationSchema: {
        email: 'required|email',
        password: 'required',
    },
    onSuccess() {
        window.location.replace(props.redirectUrl);
    },
});

const axios = window.axios;
const { isSupported, authenticate, autofill, cancel, isCancelled } = usePasskeys();

const passkeysEnabled = Boolean(props.passkeyOptionsUrl && props.passkeyLoginUrl) && isSupported();
const passkeySubmitting = ref(false);
const passkeyError = ref('');

async function login(credential) {
    await axios.post(props.passkeyLoginUrl, { credential, remember: true });
    window.location.replace(props.redirectUrl);
}

function showError(error) {
    if (isCancelled(error)) {
        return;
    }
    const data = error?.response?.data || {};
    passkeyError.value = data.errors?.passkey?.[0] || data.errors?.email?.[0] || data.message || '';
}

async function startAutofill() {
    try {
        const credential = await autofill(props.passkeyOptionsUrl);
        if (credential) {
            passkeyError.value = '';
            passkeySubmitting.value = true;
            try {
                await login(credential);
            } finally {
                passkeySubmitting.value = false;
            }
        }
    } catch (error) {
        // Not restarted here: a failing options request would loop. The button restarts it.
        showError(error);
    }
}

async function signInWithPasskey() {
    if (passkeySubmitting.value) {
        return;
    }
    passkeyError.value = '';
    passkeySubmitting.value = true;
    let failed = false;
    try {
        // Starting a new ceremony aborts the pending autofill request.
        await login(await authenticate(props.passkeyOptionsUrl));
    } catch (error) {
        showError(error);
        failed = true;
    } finally {
        passkeySubmitting.value = false;
    }
    if (failed) {
        // The button's ceremony aborted the autofill request; offer passkeys in the field again.
        startAutofill();
    }
}

onMounted(() => {
    if (passkeysEnabled) {
        startAutofill();
    }
});

onBeforeUnmount(() => {
    if (passkeysEnabled) {
        cancel();
    }
});
</script>

<style scoped>
.passkey-btn {
    --cui-btn-hover-color: #fff;
    --cui-btn-active-color: #fff;

    width: 100%;
    padding: 0.25rem 0.75rem;
    font-size: 14px;
}

.forgot-link {
    text-decoration: none;
}

.forgot-link:hover {
    text-decoration: none;
}
</style>
