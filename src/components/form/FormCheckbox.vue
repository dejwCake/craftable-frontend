<template>
    <div class="form-group row align-items-center">
        <div :class="isFormLocalized ? 'col-md-4 offset-md-4' : 'col-md-9 col-xl-7 offset-md-3'">
            <div class="form-check">
                <input class="form-check-input" :id="name" type="checkbox"
                       :checked="modelValue" @change="$emit('update:modelValue', $event.target.checked)"
                       :name="name">
                <label class="form-check-label" :for="name">{{ label }}</label>
            </div>
            <div v-if="error" class="invalid-feedback form-text" style="display: block">{{ error }}</div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    modelValue: { type: Boolean, default: false },
    name: { type: String, required: true },
    label: { type: String, required: true },
    error: { type: String, default: '' },
    isFormLocalized: { type: Boolean, default: false },
});

defineEmits(['update:modelValue']);
</script>
