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
                                type="text"
                                v-model="form.email"
                                class="form-control"
                                :class="{ 'is-invalid': errors.email }"
                                id="email"
                                name="email"
                                :placeholder="translations.email"
                            >
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
                                type="password"
                                v-model="form.password"
                                class="form-control"
                                :class="{ 'is-invalid': errors.password }"
                                id="password"
                                name="password"
                                :placeholder="translations.password"
                            >
                        </div>
                        <div v-if="errors.password" class="invalid-feedback d-block form-text">
                            {{ errors.password }}
                        </div>
                    </div>

                    <div class="mb-3">
                        <input type="hidden" name="remember" value="1">
                        <button type="submit" class="btn btn-primary submit-btn" :disabled="submitting">
                            <i v-if="submitting" class="fa fa-spinner fa-spin"></i>
                            {{ translations.button }}
                        </button>
                    </div>
                    <div class="mb-3 text-center">
                        <a :href="passwordResetUrl" class="auth-ghost-link forgot-link">{{ translations.forgotPassword }}</a>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { useBaseAuth } from '@dejwcake/craftable';

const props = defineProps({
    action: { type: String, required: true },
    redirectUrl: { type: String, default: '/admin' },
    translations: { type: Object, default: () => ({}) },
    passwordResetUrl: { type: String, default: '/admin/password-reset' },
    statusMessage: { type: String, default: '' },
    serverErrors: { type: Array, default: () => [] },
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
</script>

<style scoped>
.forgot-link {
    text-decoration: none;
}

.forgot-link:hover {
    text-decoration: none;
}
</style>
