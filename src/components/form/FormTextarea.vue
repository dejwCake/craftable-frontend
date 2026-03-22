<template>
    <div class="mb-3 row align-items-center">
        <label :for="name" class="col-md-3 col-form-label text-md-end">{{ label }}</label>
        <div class="col-md-9 col-xl-8">
            <textarea :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
                   class="form-control" :class="{'is-invalid': error}"
                   :id="name" :name="name" :placeholder="placeholder || label"
                   :rows="rows"></textarea>
            <div v-if="error" class="invalid-feedback form-text">{{ error }}</div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    modelValue: { type: String, default: '' },
    name: { type: String, required: true },
    label: { type: String, required: true },
    error: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    rows: { type: [Number, String], default: 3 },
});

defineEmits(['update:modelValue']);
</script>
