<template>
  <slot
    :form="form"
    :errors="errors"
    :submiting="submiting"
    :on-submit="() => onSubmit($refs)"
    :validate-field="validateField"
    :is-form-localized="isFormLocalized"
    :current-locale="currentLocale"
    :show-localization="showLocalization"
    :hide-localization="hideLocalization"
    :should-show-lang-group="shouldShowLangGroup"
    :other-locales="otherLocales"
    :show-localized-validation-error="showLocalizedValidationError"
    :on-small-screen="onSmallScreen"
  ></slot>
</template>

<script>
import { defineComponent } from 'vue';
import { useBaseForm } from '../composables/useBaseForm.js';

export default defineComponent({
  name: 'AuthForm',
  props: {
    action: {
      type: String,
      required: true,
    },
    locales: {
      type: Array,
      default: () => [],
    },
    defaultLocale: {
      type: String,
      default: '',
    },
    sendEmptyLocales: {
      type: Boolean,
      default: true,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
    responsiveBreakpoint: {
      type: Number,
      default: 850,
    },
  },
  setup(props) {
    return useBaseForm(props);
  },
});
</script>
