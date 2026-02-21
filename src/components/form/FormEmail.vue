<template>
    <FormInput v-bind="$props" type="email" @update:modelValue="$emit('update:modelValue', $event)" />
</template>

<script setup>
import FormInput from './FormInput.vue';

defineProps({
    modelValue: { type: [String, Number], default: '' },
    name: { type: String, required: true },
    label: { type: String, required: true },
    error: { type: String, default: '' },
    placeholder: { type: String, default: '' },
});

defineEmits(['update:modelValue']);
</script>
