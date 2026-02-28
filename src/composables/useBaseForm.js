import { ref, computed, getCurrentInstance, onBeforeUnmount } from 'vue';
import { useForm, validate as veeValidate } from 'vee-validate';
import { notifySuccess, notifyError } from '../utils/notify.js';
// Use the globally configured axios instance (with CSRF token and X-Requested-With header)
const axios = window.axios;
import { formatDate, formatDatetime, formatTime } from '../utils/dateFormatters.js';
import { getDateFnsLocale } from '../utils/dateFnsLocale.js';

export function useBaseForm(props, options = {}) {
  const instance = getCurrentInstance();
  const form = ref(props.data && Object.keys(props.data).length > 0 ? { ...props.data } : {});
  const wysiwygMedia = ref([]);
  const mediaCollections = ref([]);
  const isFormLocalized = ref(false);
  const currentLocale = ref('');
  const submitting = ref(false);
  const onSmallScreen = ref(window.innerWidth < (props.responsiveBreakpoint || 850));

  const { setErrors, errors } = useForm();

  // Date picker configs
  const datePickerConfig = ref({
    enableTimePicker: false,
    enableSeconds: false,
    modelType: 'yyyy-MM-dd HH:mm:ss',
    format: 'dd.MM.yyyy',
    locale: getDateFnsLocale(),
  });

  const timePickerConfig = ref({
    timePicker: true,
    enableTimePicker: true,
    enableSeconds: false,
    modelType: 'HH:mm:ss',
    format: 'HH:mm',
    locale: getDateFnsLocale(),
  });

  const datetimePickerConfig = ref({
    enableTimePicker: true,
    enableSeconds: false,
    modelType: 'yyyy-MM-dd HH:mm:ss',
    format: 'dd.MM.yyyy HH:mm',
    locale: getDateFnsLocale(),
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

    if (typeof options.transformData === 'function') {
      return options.transformData({ ...form.value });
    }

    return form.value;
  }

  async function onSubmit() {
    if (options.validationSchema) {
      const fieldErrors = {};
      for (const [field, rules] of Object.entries(options.validationSchema)) {
        const result = await veeValidate(form.value[field], rules, {
          name: field,
          values: form.value,
        });
        if (!result.valid) {
          fieldErrors[field] = result.errors[0];
        }
      }

      // Clear all schema field errors, then set only invalid ones
      const errorState = {};
      for (const field of Object.keys(options.validationSchema)) {
        errorState[field] = fieldErrors[field] || undefined;
      }
      setErrors(errorState);

      if (Object.keys(fieldErrors).length > 0) {
        notifyError('The form contains invalid fields.');
        return false;
      }
    }

    submitting.value = true;

    let postData = getPostData();
    if (!props.sendEmptyLocales && props.sendEmptyLocales !== undefined) {
      const filtered = {};
      for (const [key, value] of Object.entries(postData)) {
        if (!locales.value.includes(key) || (value && Object.keys(value).length > 0)) {
          filtered[key] = value;
        }
      }
      postData = filtered;
    }

    try {
      const response = await axios.post(props.action, postData);
      onSuccess(response.data);
    } catch (err) {
      onFail(err.response?.data || {});
    }
  }

  function onSuccess(data) {
    submitting.value = false;
    if (data.message) {
      notifySuccess(data.message);
    }
    if (data.redirect) {
      if (data.message) {
        setTimeout(() => window.location.replace(data.redirect), 2000);
      } else {
        window.location.replace(data.redirect);
      }
    }
  }

  function onFail(data) {
    submitting.value = false;
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
        notifyError('The form contains invalid fields.');
      }
    }
    if (data.message !== undefined) {
      notifyError(data.message);
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
    submitting,
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
    shouldShowLangGroup,

    // Vee-validate
    setErrors,

    // Date formatters (convenience re-exports)
    formatDate,
    formatDatetime,
    formatTime,
  };
}
