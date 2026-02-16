import { ref } from 'vue';
import { useForm, validate as veeValidate } from 'vee-validate';
const axios = window.axios;

export function useBaseAuth(props, options = {}) {
  const form = ref(options.formDefaults ? { ...options.formDefaults } : {});
  const submitting = ref(false);
  const successMessage = ref('');

  const { setErrors, errors } = useForm();

  async function submit() {
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

      const errorState = {};
      for (const field of Object.keys(options.validationSchema)) {
        errorState[field] = fieldErrors[field] || undefined;
      }
      setErrors(errorState);

      if (Object.keys(fieldErrors).length > 0) {
        return false;
      }
    }

    submitting.value = true;
    successMessage.value = '';

    try {
      const response = await axios.post(props.action, form.value);
      onSuccess(response.data);
    } catch (err) {
      onFail(err.response?.data || {});
    }
  }

  function onSuccess(data) {
    submitting.value = false;
    if (options.onSuccess) {
      options.onSuccess(data);
      return;
    }
    if (data.message) {
      successMessage.value = data.message;
    }
    if (data.redirect) {
      window.location.replace(data.redirect);
    }
  }

  function onFail(data) {
    submitting.value = false;
    if (data.errors !== undefined) {
      const fieldErrors = {};
      Object.keys(data.errors).forEach((key) => {
        fieldErrors[key] = data.errors[key][0];
      });
      setErrors(fieldErrors);
    }
  }

  return {
    form,
    errors,
    submitting,
    successMessage,
    submit,
    setErrors,
  };
}
