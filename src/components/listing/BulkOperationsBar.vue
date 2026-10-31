<template>
    <span class="align-middle fw-light text-dark">
        {{ translations.selected_items }} {{ selectedCount }}.
        <a v-if="selectedCount < totalCount" href="javascript:void(0)" class="text-primary" @click="onCheckAll()">
            <i v-if="loading" class="fa fa-spinner"></i>
            {{ translations.check_all_items }} {{ totalCount }}
        </a>
        <span v-if="selectedCount < totalCount" class="text-primary"> | </span>
        <a href="javascript:void(0)" class="text-primary" @click="onUncheckAll()">
            {{ translations.uncheck_all_items }}
        </a>
    </span>

    <span class="float-end pe-2">
        <slot>
            <span class="d-inline-flex gap-2">
                <button v-if="onBulkDelete" class="btn btn-sm btn-danger px-4" @click="onBulkDelete()">
                    <i class="fa fa-trash me-1"></i>
                    {{ translations.delete_btn }}
                </button>
                <button v-if="onBulkForceDelete" class="btn btn-sm btn-dark px-4" @click="onBulkForceDelete()">
                    <i class="fa fa-eraser me-1"></i>
                    {{ translations.force_delete_btn }}
                </button>
                <button v-if="onBulkRestore" class="btn btn-sm btn-success text-white px-4" @click="onBulkRestore()">
                    <i class="fa fa-trash-arrow-up me-1"></i>
                    {{ translations.restore_btn }}
                </button>
            </span>
        </slot>
    </span>
</template>

<script setup>
defineProps({
    selectedCount: { type: Number, required: true },
    totalCount: { type: Number, required: true },
    loading: { type: Boolean, default: false },
    onCheckAll: { type: Function, required: true },
    onUncheckAll: { type: Function, required: true },
    onBulkDelete: { type: Function, default: null },
    onBulkForceDelete: { type: Function, default: null },
    onBulkRestore: { type: Function, default: null },
    translations: {
        type: Object,
        default: () => ({
            selected_items: 'Selected items',
            check_all_items: 'Check all items',
            uncheck_all_items: 'Uncheck all items',
            delete_btn: 'Delete',
            force_delete_btn: 'Delete permanently',
            restore_btn: 'Restore',
        }),
    },
});
</script>
