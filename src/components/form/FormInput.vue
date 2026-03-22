<template>
    <div class="mb-3 row align-items-center">
        <label :for="name" class="col-md-3 col-form-label text-md-end">{{ label }}</label>
        <div class="col-md-9 col-xl-8">
            <input
                :id="name"
                :type="type"
                :value="modelValue"
                class="form-control"
                :class="{ 'is-invalid': error }"
                :name="name"
                :placeholder="placeholder || label"
                @input="$emit('update:modelValue', $event.target.value)"
            />
            <div v-if="error" class="invalid-feedback form-text">{{ error }}</div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    modelValue: { type: [String, Number], default: '' },
    name: { type: String, required: true },
    label: { type: String, required: true },
    error: { type: String, default: '' },
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: '' },
});

defineEmits(['update:modelValue']);
</script>
