import { ref, computed, getCurrentInstance, onBeforeUnmount } from 'vue';
import { useForm } from 'vee-validate';
import { notify } from '@kyvg/vue3-notification';
import axios from 'axios';
import { formatDate, formatDatetime, formatTime } from '../utils/dateFormatters.js';

export function useBaseForm(props, options = {}) {
  const instance = getCurrentInstance();
  const form = ref(props.data && Object.keys(props.data).length > 0 ? { ...props.data } : {});
  const wysiwygMedia = ref([]);
  const mediaCollections = ref([]);
  const isFormLocalized = ref(false);
  const currentLocale = ref('');
  const submiting = ref(false);
  const onSmallScreen = ref(window.innerWidth < (props.responsiveBreakpoint || 850));

  const { validate, setErrors, resetForm, errors } = useForm();

  // Date picker configs
  const datePickerConfig = ref({
    format: 'yyyy-MM-dd HH:mm:ss',
    textInput: true,
    locale: null,
    altFormat: 'd.m.Y',
  });

  const timePickerConfig = ref({
    timePicker: true,
    enableSeconds: true,
    format: 'HH:mm:ss',
    textInput: true,
    locale: null,
  });

  const datetimePickerConfig = ref({
    enableTimePicker: true,
    enableSeconds: true,
    format: 'yyyy-MM-dd HH:mm:ss',
    textInput: true,
    locale: null,
  });

  // Localization
  const locales = computed(() => props.locales || []);
  const defaultLocale = computed(() => props.defaultLocale || (locales.value.length > 0 ? locales.value[0] : ''));

  const otherLocales = computed(() => {
    return locales.value.filter((x) => x !== defaultLocale.value);
  });

  const showLocalizedValidationError = computed(() => {
    return otherLocales.value.some((lang) => {
      const errorKeys = Object.keys(errors.value);
      return errorKeys.some((field) => {
        return field.endsWith('_' + lang) || field.startsWith(lang + '_');
      });
    });
  });

  // Init localization
  if (locales.value.length > 0) {
    currentLocale.value = defaultLocale.value;
  }

  // Resize handler
  function onResize() {
    onSmallScreen.value = window.innerWidth < (props.responsiveBreakpoint || 850);
  }

  window.addEventListener('resize', onResize);
  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
  });

  // Methods
  function getPostData() {
    const refs = instance?.proxy?.$refs || {};
    console.log(refs, mediaCollections.value);
    if (mediaCollections.value) {
      mediaCollections.value.forEach((collection) => {
        if (form.value[collection]) {
          console.warn(
            "MediaUploader warning: Media input must have a unique name, '" +
              collection +
              "' is already defined in regular inputs."
          );
        }

        const uploaderRef = refs[collection + '_uploader'];
        if (uploaderRef) {
          const uploader = Array.isArray(uploaderRef) ? uploaderRef[0] : uploaderRef;
          if (uploader && typeof uploader.getFiles === 'function') {
            form.value[collection] = uploader.getFiles();
          }
        }
      });
    }
    form.value['wysiwygMedia'] = wysiwygMedia.value;

    return form.value;
  }

  async function onSubmit() {
    const { valid } = await validate();
    if (!valid) {
      notify({
        type: 'error',
        title: 'Error!',
        text: 'The form contains invalid fields.',
      });
      return false;
    }

    let data = form.value;
    if (!props.sendEmptyLocales && props.sendEmptyLocales !== undefined) {
      const filtered = {};
      for (const [key, value] of Object.entries(form.value)) {
        if (!locales.value.includes(key) || (value && Object.keys(value).length > 0)) {
          filtered[key] = value;
        }
      }
      data = filtered;
    }

    submiting.value = true;

    try {
      const response = await axios.post(props.action, getPostData());
      onSuccess(response.data);
    } catch (err) {
      onFail(err.response?.data || {});
    }
  }

  function onSuccess(data) {
    submiting.value = false;
    if (data.redirect) {
      window.location.replace(data.redirect);
    }
  }

  function onFail(data) {
    submiting.value = false;
    if (data.errors !== undefined) {
      const fieldErrors = {};
      Object.keys(data.errors).forEach((key) => {
        const splitted = key.split('.', 2);
        if (splitted.length > 1) {
          fieldErrors[splitted[0] + '_' + splitted[1]] = data.errors[key][0];
        } else {
          fieldErrors[key] = data.errors[key][0];
        }
      });
      setErrors(fieldErrors);
      if (data.message === undefined) {
        notify({
          type: 'error',
          title: 'Error!',
          text: 'The form contains invalid fields.',
        });
      }
    }
    if (data.message !== undefined) {
      notify({
        type: 'error',
        title: 'Error!',
        text: data.message,
      });
    }
  }

  function getLocalizedFormDefaults() {
    const object = {};
    locales.value.forEach((locale) => {
      object[locale] = null;
    });
    return object;
  }

  function showLocalization() {
    isFormLocalized.value = true;
    currentLocale.value = otherLocales.value[0];
    const container = document.querySelector('.container-xl');
    if (container) container.classList.add('width-auto');
  }

  function hideLocalization() {
    isFormLocalized.value = false;
    const container = document.querySelector('.container-xl');
    if (container) container.classList.remove('width-auto');
  }

  function validateField(event) {
    // In vee-validate 4, errors are cleared automatically on revalidation
    // This is a no-op placeholder for backwards compat
  }

  function shouldShowLangGroup(locale) {
    if (!onSmallScreen.value) {
      if (defaultLocale.value === locale) return true;
      return isFormLocalized.value && currentLocale.value === locale;
    } else {
      return currentLocale.value === locale;
    }
  }

  return {
    // State
    form,
    wysiwygMedia,
    mediaCollections,
    isFormLocalized,
    currentLocale,
    submiting,
    onSmallScreen,
    errors,

    // Configs
    datePickerConfig,
    timePickerConfig,
    datetimePickerConfig,

    // Computed
    locales,
    defaultLocale,
    otherLocales,
    showLocalizedValidationError,

    // Methods
    getPostData,
    onSubmit,
    onSuccess,
    onFail,
    getLocalizedFormDefaults,
    showLocalization,
    hideLocalization,
    validateField,
    shouldShowLangGroup,
    onResize,

    // Vee-validate
    validate,
    setErrors,
    resetForm,

    // Date formatters (convenience re-exports)
    formatDate,
    formatDatetime,
    formatTime,
  };
}
