<template>
    <div class="form-group row align-items-center">
        <label :for="name" class="col-form-label text-md-end"
               :class="'col-md-3'">{{ label }}</label>
        <div :class="'col-md-9 col-xl-8'">
            <Multiselect :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
                         :class="{'is-invalid': error}"
                         :placeholder="placeholder" :options="options"
                         :label="optionLabel || undefined" :track-by="trackBy || undefined"
                         open-direction="bottom"></Multiselect>
            <div v-if="error" class="invalid-feedback d-block form-text">{{ error }}</div>
        </div>
    </div>
</template>

<script setup>
import Multiselect from 'vue-multiselect';

defineProps({
    modelValue: { type: [String, Number, Array, Object], default: '' },
    name: { type: String, required: true },
    label: { type: String, required: true },
    error: { type: String, default: '' },
    options: { type: Array, required: true },
    placeholder: { type: String, default: '' },
    trackBy: { type: String, default: '' },
    optionLabel: { type: String, default: '' },
});

defineEmits(['update:modelValue']);
</script>
