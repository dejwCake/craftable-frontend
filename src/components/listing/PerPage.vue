<template>
    <select class="form-select" :value="modelValue" @change="$emit('update:modelValue', +$event.target.value)">
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="100">100</option>
    </select>
</template>

<script setup>
defineProps({
    modelValue: { type: [Number, String], default: 10 },
});

defineEmits(['update:modelValue']);
</script>
