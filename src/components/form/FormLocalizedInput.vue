<template>
    <div class="mb-3 row align-items-center">
        <label :for="name + '_' + locales[0]" class="col-md-3 col-form-label text-md-end">{{ label }}</label>
        <div class="col-md-9 col-xl-8">
            <div :class="{'d-flex gap-2': isFormLocalized}">
                <div v-for="locale in locales" :key="locale" v-show="shouldShowLangGroup(locale)"
                     :class="{'flex-fill': isFormLocalized}">
                    <input type="text"
                        :value="modelValue[locale]"
                        @input="onInput(locale, $event.target.value)"
                        class="form-control" :class="{'is-invalid': errors[name + '_' + locale]}"
                        :id="name + '_' + locale" :name="name + '_' + locale"
                        :placeholder="isFormLocalized ? locale.toUpperCase() : label">
                    <div v-if="errors[name + '_' + locale]" class="invalid-feedback d-block form-text">
                        {{ errors[name + '_' + locale] }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    modelValue: { type: Object, required: true },
    name: { type: String, required: true },
    label: { type: String, required: true },
    errors: { type: Object, default: () => ({}) },
    locales: { type: Array, required: true },
    shouldShowLangGroup: { type: Function, required: true },
    isFormLocalized: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

function onInput(locale, value) {
    emit('update:modelValue', { ...props.modelValue, [locale]: value });
}
</script>
