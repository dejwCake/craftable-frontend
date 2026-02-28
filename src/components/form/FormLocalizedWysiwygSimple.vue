<template>
    <div class="form-group row align-items-center">
        <label :for="name + '_' + locales[0]" class="col-md-3 col-form-label text-md-end">{{ label }}</label>
        <div class="col-md-9 col-xl-8">
            <div :class="{'d-flex gap-2': isFormLocalized}">
                <div v-for="locale in locales" :key="locale" v-show="shouldShowLangGroup(locale)"
                     :class="{'flex-fill localized-editor': isFormLocalized}">
                    <TiptapEditor :model-value="modelValue[locale]"
                        @update:model-value="onInput(locale, $event)"
                        :id="name + '_' + locale" :name="name + '_' + locale"
                        :upload-url="uploadUrl" v-bind="config ? { config } : {}"></TiptapEditor>
                    <div v-if="errors[name + '_' + locale]" class="invalid-feedback d-block form-text">
                        {{ errors[name + '_' + locale] }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import TiptapEditor from './TiptapEditor.vue';

const props = defineProps({
    modelValue: { type: Object, required: true },
    name: { type: String, required: true },
    label: { type: String, required: true },
    errors: { type: Object, default: () => ({}) },
    locales: { type: Array, required: true },
    shouldShowLangGroup: { type: Function, required: true },
    isFormLocalized: { type: Boolean, default: false },
    config: { type: Object, default: null },
    uploadUrl: { type: String, default: '/admin/wysiwyg-media' },
});

const emit = defineEmits(['update:modelValue']);

function onInput(locale, value) {
    emit('update:modelValue', { ...props.modelValue, [locale]: value });
}
</script>

<style scoped>
.localized-editor {
    min-width: 0;
}
</style>
