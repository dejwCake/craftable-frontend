<template>
    <div class="card">
        <div class="card-body">
            <form role="form" method="POST" :action="action" novalidate @submit.prevent="submit">
                <div class="auth-header">
                    <h1 class="auth-title">{{ translations.title }}</h1>
                    <p class="auth-subtitle">{{ translations.note }}</p>
                </div>
                <div class="auth-body">
                    <div v-if="successMessage" class="alert alert-success">
                        {{ successMessage }}
                    </div>
                    <div v-if="statusMessage && !successMessage" class="alert alert-success">
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
                        <div v-if="errors.email" class="invalid-feedback d-block">
                            {{ errors.email }}
                        </div>
                    </div>

                    <div class="mb-3">
                        <button type="submit" class="btn btn-primary submit-btn" :disabled="submitting">
                            <i v-if="submitting" class="fa fa-spinner fa-spin"></i>
                            {{ translations.button }}
                        </button>
                    </div>

                    <div v-if="loginUrl" class="text-center">
                        <a :href="loginUrl" class="auth-ghost-link">{{ translations.backToLogin }}</a>
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
    loginUrl: { type: String, default: '' },
    translations: { type: Object, default: () => ({}) },
    statusMessage: { type: String, default: '' },
    serverErrors: { type: Array, default: () => [] },
});

const { form, errors, submitting, successMessage, submit } = useBaseAuth(props, {
    formDefaults: { email: '' },
    validationSchema: {
        email: 'required|email',
    },
});
</script>

<style scoped>
.submit-btn {
    display: block;
    width: 100%;
    padding: 1rem;
    font-size: 16px;
    color: #fff;
}

.submit-btn:hover,
.submit-btn:focus,
.submit-btn:disabled {
    color: #fff;
}

label {
    font-size: .875rem;
}
</style>
