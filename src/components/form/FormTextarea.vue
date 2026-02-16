<template>
    <div class="form-group row align-items-center">
        <label :for="name" class="col-form-label text-md-end"
               :class="isFormLocalized ? 'col-md-4' : 'col-md-3'">{{ label }}</label>
        <div :class="isFormLocalized ? 'col-md-4' : 'col-md-9 col-xl-7'">
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
    isFormLocalized: { type: Boolean, default: false },
});

defineEmits(['update:modelValue']);
</script>
