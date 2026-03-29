<template>
    <i class="fa fa-align-justify"></i> {{ translations.listing_title }}
    <a v-if="exportUrl" class="btn btn-primary btn-sm float-end mb-0 ms-2" :href="exportUrl" role="button">
        <i class="fa fa-file-excel-o"></i>&nbsp; {{ translations.export_btn }}
    </a>
    <a v-if="createUrl" class="btn btn-primary btn-spinner btn-sm float-end mb-0" :href="createUrl" role="button">
        <i class="fa fa-plus"></i>&nbsp; {{ translations.create_btn }}
    </a>
</template>

<script setup>
defineProps({
    createUrl: { type: String, default: '' },
    exportUrl: { type: String, default: '' },
    translations: {
        type: Object,
        default: () => ({
            listing_title: 'Listing',
            create_btn: 'New',
            export_btn: 'Export',
        }),
    },
});
</script>
