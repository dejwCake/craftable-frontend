<template>
    <a class="btn btn-sm btn-outline-secondary" :href="url">
        <i class="fa fa-arrow-left"></i> {{ translations.back }}
    </a>
</template>

<script setup>
defineProps({
    url: { type: String, required: true },
    translations: {
        type: Object,
        default: () => ({
            back: 'Back',
        }),
    },
});
</script>
