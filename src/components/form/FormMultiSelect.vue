<template>
    <div class="mb-3 row align-items-center">
        <label :for="name" class="col-form-label text-md-end"
               :class="'col-md-3'">{{ label }}</label>
        <div :class="'col-md-9 col-xl-8'">
            <Multiselect :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
                         :class="{'is-invalid': error}"
                         :placeholder="placeholder" :options="options"
                         :multiple="true" :label="optionLabel" :track-by="trackBy"
                         open-direction="bottom"></Multiselect>
            <div v-if="error" class="invalid-feedback d-block form-text">{{ error }}</div>
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
});

defineEmits(['update:modelValue']);
</script>
