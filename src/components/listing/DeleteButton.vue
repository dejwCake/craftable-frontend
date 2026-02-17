<template>
  <button
    type="button"
    class="btn btn-sm btn-danger"
    :title="translations.delete_btn"
    @click="onDelete"
  >
    <i class="fa fa-trash"></i>
  </button>
</template>

<script setup>
import axios from 'axios';
import { notify } from '@kyvg/vue3-notification';

const props = defineProps({
  url: { type: String, required: true },
  translations: {
    type: Object,
    default: () => ({
      delete_btn: 'Delete',
      confirm_text: 'Do you really want to delete this item?',
    }),
  },
});

const emit = defineEmits(['deleted']);

function onDelete() {
  if (!window.confirm(props.translations.confirm_text)) return;

  axios.delete(props.url).then(
    (response) => {
      notify({
        type: 'success',
        title: 'Success!',
        text: response.data.message || 'Item successfully deleted.',
      });
      emit('deleted');
    },
    (error) => {
      notify({
        type: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'An error has occured.',
      });
    }
  );
}
</script>
