<template>
  <div class="input-group">
    <slot name="prepend" />
    <input
      class="form-control"
      :placeholder="translations.search_placeholder"
      :value="search"
      @input="$emit('update:search', $event.target.value)"
      @keyup.enter="doSearch"
    />
    <button
      v-if="search"
      type="button"
      class="btn btn-outline-secondary"
      @click="clearSearch"
    >
      <i class="fa fa-times"></i>
    </button>
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
