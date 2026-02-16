<template>
    <div class="form-group row align-items-center">
        <label :for="name" class="col-form-label text-md-end"
               :class="isFormLocalized ? 'col-md-4' : 'col-md-3'">{{ label }}</label>
        <div :class="isFormLocalized ? 'col-md-4' : 'col-md-9 col-xl-7'">
            <Multiselect :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
                         :class="{'is-invalid': error}"
                         :placeholder="placeholder" :options="options"
                         :multiple="true" :label="optionLabel" :track-by="trackBy"
                         open-direction="bottom"></Multiselect>
            <div v-if="error" class="invalid-feedback form-text" style="display: block">{{ error }}</div>
        </div>
    </div>
</template>

<script setup>
import Multiselect from 'vue-multiselect';

defineProps({
    modelValue: { type: Array, default: () => [] },
    name: { type: String, required: true },
    label: { type: String, required: true },
    error: { type: String, default: '' },
    options: { type: Array, required: true },
    placeholder: { type: String, default: '' },
    trackBy: { type: String, default: 'id' },
    optionLabel: { type: String, default: 'name' },
    isFormLocalized: { type: Boolean, default: false },
});

defineEmits(['update:modelValue']);
</script>
