<template>
  <div class="form-check form-switch">
    <input
      class="form-check-input"
      :class="switchClass"
      type="checkbox"
      role="switch"
      :checked="!!modelValue"
      @change="toggle"
    />
  </div>
</template>

<script setup>
import axios from 'axios';
import { notifySuccess, notifyError } from '../../utils/notify.js';
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: [Boolean, Number, String], required: true },
  url: { type: String, required: true },
  column: { type: String, required: true },
  row: { type: Object, required: true },
  variant: { type: String, default: 'success' },
});

const emit = defineEmits(['update:modelValue']);

const switchClass = computed(() => `form-switch-${props.variant}`);

function toggle() {
  const newValue = !props.modelValue;
  emit('update:modelValue', newValue);

  const data = { ...props.row, [props.column]: newValue };

  axios.post(props.url, data).then(
    (response) => {
      notifySuccess(response.data.message);
    },
    (error) => {
      emit('update:modelValue', props.modelValue);
      notifyError(error.response?.data?.message);
    }
  );
}
</script>
