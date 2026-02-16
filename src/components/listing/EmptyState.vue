<template>
  <div class="no-items-found" v-if="show">
    <i class="icon-magnifier"></i>
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
  translations: { type: Object, required: true },
});
</script>
