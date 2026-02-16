<template>
    <div class="row">
        <div class="col-md" v-for="locale in locales" :key="locale"
             v-show="shouldShowLangGroup(locale)">
            <div class="form-group row align-items-center">
                <label :for="name + '_' + locale" class="col-md-2 col-form-label text-md-end">{{ label }}</label>
                <div class="col-md-9" :class="{'col-xl-8': !isFormLocalized}">
                    <input type="text"
                        :value="modelValue[locale]"
                        @input="onInput(locale, $event.target.value)"
                        class="form-control" :class="{'is-invalid': errors[name + '_' + locale]}"
                        :id="name + '_' + locale" :name="name + '_' + locale"
                        :placeholder="label">
                    <div v-if="errors[name + '_' + locale]" class="invalid-feedback form-text">
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
