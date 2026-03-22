<template>
    <div v-if="locales.length > 0" class="row mb-2 localization-bar">
        <div class="offset-md-3 col-md-9 col-xl-8 text-start" :class="{ 'd-none': onSmallScreen }">
            <small v-if="!isFormLocalized"
                >{{ currentlyEditingText }}<span v-if="otherLocales.length > 1"> {{ moreCanBeManagedText }}</span> |
                <a href="#" @click.prevent="$emit('show-localization')">{{
                    translations.manage_translations
                }}</a></small
            >
            <i v-if="!isFormLocalized && showLocalizedValidationError" class="localization-error"></i>

            <div v-if="isFormLocalized" class="d-flex align-items-center gap-2">
                <small class="text-nowrap">{{ translations.choose_translation_to_edit }}</small>
                <Multiselect
                    :model-value="currentLocale"
                    :options="localeOptions"
                    :custom-label="(l) => l.toUpperCase()"
                    :searchable="false"
                    :allow-empty="false"
                    class="locale-selector"
                    @update:model-value="$emit('update:currentLocale', $event)"
                />
                <i v-if="showLocalizedValidationError" class="localization-error"></i>
                <small
                    ><a href="#" @click.prevent="$emit('hide-localization')">{{ translations.hide }}</a></small
                >
            </div>
        </div>

        <div
            v-if="onSmallScreen"
            class="col"
            :class="{ 'language-mobile': true, 'text-danger': !isFormLocalized && showLocalizedValidationError }"
        >
            <small
                >{{ translations.choose_translation_to_edit }}
                <Multiselect
                    :model-value="currentLocale"
                    :options="[defaultLocale, ...otherLocales]"
                    :custom-label="(l) => l.toUpperCase()"
                    :searchable="false"
                    :allow-empty="false"
                    class="locale-selector"
                    @update:model-value="$emit('update:currentLocale', $event)"
                />
                <i v-if="showLocalizedValidationError" class="localization-error"></i>
            </small>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import Multiselect from 'vue-multiselect';

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
    return props.onSmallScreen ? [props.defaultLocale, ...props.otherLocales] : [...props.otherLocales];
});
</script>

<style scoped>
.locale-selector {
    display: inline-block;
    width: 75px;
    vertical-align: middle;
}
</style>
