<template>
    <div class="row">
        <div class="col-md" v-for="locale in locales" :key="locale"
             v-show="shouldShowLangGroup(locale)">
            <div class="form-group row align-items-center">
                <label :for="name + '_' + locale" class="col-md-2 col-form-label text-md-end">{{ label }}</label>
                <div class="col-md-9" :class="{'col-xl-8': !isFormLocalized}">
                    <TiptapEditor :model-value="modelValue[locale]"
                        @update:model-value="onInput(locale, $event)"
                        :id="name + '_' + locale" :name="name + '_' + locale"
                        v-bind="config ? { config } : {}"></TiptapEditor>
                    <div v-if="errors[name + '_' + locale]" class="invalid-feedback form-text" style="display: block">
                        {{ errors[name + '_' + locale] }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import TiptapEditor from '../TiptapEditor.vue';

const props = defineProps({
    modelValue: { type: Object, required: true },
    name: { type: String, required: true },
    label: { type: String, required: true },
    errors: { type: Object, default: () => ({}) },
    locales: { type: Array, required: true },
    shouldShowLangGroup: { type: Function, required: true },
    isFormLocalized: { type: Boolean, default: false },
    config: { type: Object, default: null },
});

const emit = defineEmits(['update:modelValue']);

function onInput(locale, value) {
    emit('update:modelValue', { ...props.modelValue, [locale]: value });
}
</script>
