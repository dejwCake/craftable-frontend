<template>
  <div class="input-group">
    <slot name="prepend" />
    <div class="search-wrapper form-control d-flex align-items-center p-0">
      <input
        class="search-input border-0 shadow-none ps-3"
        :placeholder="translations.search_placeholder"
        :value="search"
        @input="$emit('update:search', $event.target.value)"
        @keyup.enter="doSearch"
      />
      <button
        v-if="search"
        type="button"
        class="search-clear border-0 bg-transparent pe-1 ps-0 flex-shrink-0"
        @click="clearSearch"
      >
        <i class="fa fa-times"></i>
      </button>
    </div>
    <button
      type="button"
      class="btn btn-primary"
      @click="doSearch"
    >
      <i class="fa fa-search"></i>&nbsp; {{ translations.search_btn }}
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  search: { type: String, default: '' },
  filterFn: { type: Function, required: true },
  translations: {
    type: Object,
    default: () => ({ search_placeholder: 'Search...', search_btn: 'Search' }),
  },
});

const emit = defineEmits(['update:search']);

function doSearch() {
  props.filterFn('search', props.search);
}

function clearSearch() {
  emit('update:search', '');
  props.filterFn('search', '');
}
</script>

<style scoped>
.search-wrapper {
  padding-right: 0 !important;
}

.search-input {
  outline: none;
  min-width: 0;
  flex: 1 1 0;
}

.search-clear {
  color: #e55353;
}
</style>
