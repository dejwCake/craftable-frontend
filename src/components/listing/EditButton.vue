<template>
  <a
    class="btn btn-sm btn-spinner btn-info"
    :href="url"
    :title="translations.edit_btn"
    role="button"
  >
    <i class="fa fa-edit"></i>
  </a>
</template>

<script setup>
defineProps({
  url: { type: String, required: true },
  translations: {
    type: Object,
    default: () => ({
      edit_btn: 'Edit',
    }),
  },
});
</script>
