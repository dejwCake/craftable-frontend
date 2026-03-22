<template>
    <span class="align-middle fw-light text-dark">
        {{ translations.selected_items }} {{ selectedCount }}.
        <a
            href="javascript:void(0)"
            class="text-primary"
            @click="onCheckAll()"
            v-if="selectedCount < totalCount"
        >
            <i v-if="loading" class="fa fa-spinner"></i>
            {{ translations.check_all_items }} {{ totalCount }}
        </a>
        <span class="text-primary" v-if="selectedCount < totalCount"> | </span>
        <a
            href="javascript:void(0)"
            class="text-primary"
            @click="onUncheckAll()"
        >
            {{ translations.uncheck_all_items }}
        </a>
    </span>

    <span class="float-end pe-2">
        <slot>
            <button
                class="btn btn-sm btn-danger px-4"
                @click="onBulkDelete()"
            >
                {{ translations.delete_btn }}
            </button>
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
    onBulkDelete: { type: Function, required: true },
    translations: {
        type: Object,
        default: () => ({
            selected_items: 'Selected items',
            check_all_items: 'Check all items',
            uncheck_all_items: 'Uncheck all items',
            delete_btn: 'Delete',
        }),
    },
});
</script>
