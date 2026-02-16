<template>
  <tr v-show="visible">
    <td class="bg-bulk-info d-table-cell text-center" :colspan="colspan">
      <span class="align-middle fw-light text-dark">
        {{ translations.selected_items }} {{ selectedCount }}.
        <a
          href="#"
          class="text-primary"
          @click="onCheckAll()"
          v-if="selectedCount < totalCount"
        >
          <i class="fa" :class="loading ? 'fa-spinner' : ''"></i>
          {{ translations.check_all_items }} {{ totalCount }}
        </a>
        <span class="text-primary">|</span>
        <a
          href="#"
          class="text-primary"
          @click="onUncheckAll()"
        >
          {{ translations.uncheck_all_items }}
        </a>
      </span>

      <span class="float-end pe-2">
        <slot>
          <button
            class="btn btn-sm btn-danger pe-3 ps-3"
            @click="onBulkDelete()"
          >
            {{ translations.delete_btn }}
          </button>
        </slot>
      </span>
    </td>
  </tr>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, required: true },
  selectedCount: { type: Number, required: true },
  totalCount: { type: Number, required: true },
  loading: { type: Boolean, default: false },
  colspan: { type: [Number, String], default: 99 },
  onCheckAll: { type: Function, required: true },
  onUncheckAll: { type: Function, required: true },
  onBulkDelete: { type: Function, required: true },
  translations: { type: Object, required: true },
});
</script>
