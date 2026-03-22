<template>
    <div class="mb-3 row align-items-center">
        <div class="col-md-9 col-xl-8 offset-md-3">
            <div class="form-check">
                <input
                    :id="name"
                    class="form-check-input"
                    type="checkbox"
                    :checked="modelValue"
                    :name="name"
                    @change="$emit('update:modelValue', $event.target.checked)"
                />
                <label class="form-check-label" :for="name">{{ label }}</label>
            </div>
            <div v-if="error" class="invalid-feedback d-block form-text">{{ error }}</div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    modelValue: { type: Boolean, default: false },
    name: { type: String, required: true },
    label: { type: String, required: true },
    error: { type: String, default: '' },
});

defineEmits(['update:modelValue']);
</script>
