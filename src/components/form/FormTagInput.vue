<template>
    <div class="mb-3 row align-items-center">
        <label :for="name" class="col-md-3 col-form-label text-md-end">{{ label }}</label>
        <div class="col-md-9 col-xl-8">
            <Multiselect
                :model-value="modelValue"
                :class="{ 'is-invalid': error }"
                :placeholder="placeholder"
                :options="modelValue"
                :multiple="true"
                :taggable="true"
                :close-on-select="false"
                :tag-placeholder="tagPlaceholder"
                open-direction="bottom"
                @tag="$emit('update:modelValue', [...modelValue, $event])"
                @update:model-value="$emit('update:modelValue', $event)"
            ></Multiselect>
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
    placeholder: { type: String, default: '' },
    tagPlaceholder: { type: String, default: '' },
});

defineEmits(['update:modelValue']);
</script>
