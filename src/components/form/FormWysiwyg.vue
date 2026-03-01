<template>
    <div class="mb-3 row align-items-center">
        <label :for="name" class="col-form-label text-md-end"
               :class="'col-md-3'">{{ label }}</label>
        <div :class="'col-md-9 col-xl-8'">
            <CkeditorEditor :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
                :id="name" :name="name" :upload-url="uploadUrl"
                v-bind="config ? { config } : {}"></CkeditorEditor>
            <div v-if="error" class="invalid-feedback d-block form-text">{{ error }}</div>
        </div>
    </div>
</template>

<script setup>
import CkeditorEditor from './CkeditorEditor.vue';

defineProps({
    modelValue: { type: String, default: '' },
    name: { type: String, required: true },
    label: { type: String, required: true },
    error: { type: String, default: '' },
    config: { type: Object, default: null },
    uploadUrl: { type: String, default: '/admin/wysiwyg-media' },
});

defineEmits(['update:modelValue']);
</script>
