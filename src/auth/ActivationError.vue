<template>
    <div class="card">
        <div class="card-body">
            <div class="auth-header">
                <h1 class="auth-title">{{ translations.title }}</h1>
            </div>
            <div class="auth-body">
                <div v-if="serverErrors.length" class="alert alert-danger">
                    <ul>
                        <li v-for="(error, index) in serverErrors" :key="index">{{ error }}</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    translations: { type: Object, default: () => ({}) },
    serverErrors: { type: Array, default: () => [] },
});
</script>
