<template>
    <i class="fa fa-align-justify"></i> {{ translations.listing_title }}
    <a v-if="createUrl" class="btn btn-primary btn-spinner btn-sm float-end mb-0" :href="createUrl" role="button">
        <i class="fa fa-plus"></i>&nbsp; {{ translations.create_btn }}
    </a>
</template>

<script setup>
defineProps({
    createUrl: { type: String, default: '' },
    translations: {
        type: Object,
        default: () => ({
            listing_title: 'Listing',
            create_btn: 'New',
        }),
    },
});
</script>
