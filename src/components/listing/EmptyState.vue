<template>
  <div class="no-items-found" v-if="show">
    <i class="fa fa-magnifying-glass"></i>
    <h3>{{ translations.no_items }}</h3>
    <p>{{ translations.try_changing_items }}</p>
    <a
      v-if="createUrl"
      class="btn btn-primary btn-spinner"
      :href="createUrl"
      role="button"
    >
      <i class="fa fa-plus"></i>&nbsp; {{ translations.create_btn }}
    </a>
  </div>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: true },
  createUrl: { type: String, default: '' },
  translations: {
    type: Object,
    default: () => ({
      no_items: 'Could not find any items',
      try_changing_items: 'Try changing the filters or add a new one',
      create_btn: 'New',
    }),
  },
});
</script>
