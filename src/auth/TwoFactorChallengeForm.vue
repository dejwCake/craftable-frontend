<template>
    <div class="card">
        <div class="card-body">
            <form role="form" method="POST" :action="action" novalidate @submit.prevent="onSubmit">
                <div class="auth-header">
                    <h1 class="auth-title">{{ translations.title }}</h1>
                    <p class="auth-subtitle">
                        {{ useRecoveryCode ? translations.recoveryCodeText : translations.codeText }}
                    </p>
                </div>
                <div class="auth-body">
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
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBaseAuth } from '@dejwcake/craftable';

const props = defineProps({
    action: { type: String, required: true },
    redirectUrl: { type: String, default: '/admin' },
    translations: { type: Object, default: () => ({}) },
});

const useRecoveryCode = ref(false);
// useBaseAuth reads the schema on each submit, so toggling swaps the validated field.
const validationSchema = { code: 'required' };

const { form, errors, submitting, onSubmit } = useBaseAuth(props, {
    formDefaults: { code: '', recovery_code: '' },
    validationSchema,
    onSuccess(data) {
        window.location.replace(data.redirect || props.redirectUrl);
    },
});

function toggle() {
    useRecoveryCode.value = !useRecoveryCode.value;
    form.value = { code: '', recovery_code: '' };
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
