<template>
    <div class="form-group row align-items-center">
        <label :for="name" class="col-form-label text-md-end"
               :class="isFormLocalized ? 'col-md-4' : 'col-md-3'">{{ label }}</label>
        <div :class="isFormLocalized ? 'col-md-4' : 'col-md-9 col-xl-7'">
            <multiselect :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
                         :class="{'is-invalid': error}"
                         :placeholder="placeholder" :options="options"
                         open-direction="bottom"></multiselect>
            <div v-if="error" class="invalid-feedback form-text" style="display: block">{{ error }}</div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    modelValue: { type: [String, Number, Array, Object], default: '' },
    name: { type: String, required: true },
    label: { type: String, required: true },
    error: { type: String, default: '' },
    options: { type: Array, required: true },
    placeholder: { type: String, default: '' },
    isFormLocalized: { type: Boolean, default: false },
});

defineEmits(['update:modelValue']);
</script>
