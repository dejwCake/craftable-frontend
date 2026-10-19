<template>
    <a class="btn btn-sm btn-spinner btn-info" :href="url" :title="translations.show_btn" role="button">
        <i class="fa fa-eye"></i>
    </a>
</template>

<script setup>
defineProps({
    url: { type: String, required: true },
    translations: {
        type: Object,
        default: () => ({
            show_btn: 'Show',
        }),
    },
});
</script>
