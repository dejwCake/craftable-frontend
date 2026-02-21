<template>
    <div class="row form-group localization-bar" v-if="locales.length > 0">
        <div :class="{'col-xl-10 col-md-11 text-end': !isFormLocalized, 'col text-center': isFormLocalized, 'd-none': onSmallScreen }">
            <small>{{ currentlyEditingText }}<span v-if="!isFormLocalized && otherLocales.length > 1"> {{ moreCanBeManagedText }}</span><span v-if="!isFormLocalized"> | <a href="#" @click.prevent="$emit('show-localization')">{{ translations.manage_translations }}</a></span></small>
            <i class="localization-error" v-if="!isFormLocalized && showLocalizedValidationError"></i>
        </div>

        <div class="col text-center" :class="{'language-mobile': onSmallScreen, 'has-error': !isFormLocalized && showLocalizedValidationError}" v-if="isFormLocalized || onSmallScreen">
            <small>{{ translations.choose_translation_to_edit }}
                <Multiselect
                    :model-value="currentLocale"
                    @update:model-value="$emit('update:currentLocale', $event)"
                    :options="localeOptions"
                    :custom-label="l => l.toUpperCase()"
                    :searchable="false"
                    :allow-empty="false"
                    class="locale-selector"
                />
                <i class="localization-error" v-if="isFormLocalized && showLocalizedValidationError"></i>
            </small>
            <div class="mt-1">
                <small><a href="#" @click.prevent="$emit('hide-localization')">{{ translations.hide }}</a></small>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    translations: { type: Object, required: true },
    locales: { type: Array, required: true },
    defaultLocale: { type: String, required: true },
    otherLocales: { type: Array, required: true },
    isFormLocalized: { type: Boolean, required: true },
    currentLocale: { type: String, required: true },
    onSmallScreen: { type: Boolean, default: false },
    showLocalizedValidationError: { type: Boolean, default: false },
});

defineEmits(['show-localization', 'hide-localization', 'update:currentLocale']);

const currentlyEditingText = computed(() => {
    if (!props.translations.currently_editing_translation) return '';
    return props.translations.currently_editing_translation.replace(':locale', props.defaultLocale.toUpperCase());
});

const moreCanBeManagedText = computed(() => {
    if (!props.translations.more_can_be_managed) return '';
    return props.translations.more_can_be_managed.replace(':count', String(props.otherLocales.length));
});

const localeOptions = computed(() => {
    return props.onSmallScreen
        ? [props.defaultLocale, ...props.otherLocales]
        : [...props.otherLocales];
});
</script>

<style scoped>
.localization-bar {
    padding-bottom: 10px;
}

.locale-selector {
    display: inline-block;
    width: 80px;
    vertical-align: middle;
}
</style>
