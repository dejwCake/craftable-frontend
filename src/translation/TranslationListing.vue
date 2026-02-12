<template>
  <slot
    :collection="collection"
    :pagination="pagination"
    :order-by="orderBy"
    :filters="filters"
    :search="search"
    :now="now"
    :bulk-items="bulkItems"
    :bulk-checking-all-loader="bulkCheckingAllLoader"
    :is-clicked-all="isClickedAll"
    :clicked-bulk-items-count="clickedBulkItemsCount"
    :load-data="loadData"
    :filter="filter"
    :delete-item="deleteItem"
    :toggle-switch="toggleSwitch"
    :on-bulk-item-clicked="onBulkItemClicked"
    :on-bulk-items-clicked-all-with-pagination="onBulkItemsClickedAllWithPagination"
    :on-bulk-items-clicked-all-uncheck="onBulkItemsClickedAllUncheck"
    :bulk-delete="bulkDelete"
    :template-checked="templateChecked"
    :export-multiselect="exportMultiselect"
    :languages-to-export="languagesToExport"
    :import-language="importLanguage"
    :only-missing="onlyMissing"
    :current-step="currentStep"
    :scanning="scanning"
    :filtered-group="filteredGroup"
    :last-step="lastStep"
    :rescan="rescan"
    :filter-group="filterGroup"
    :reset-group="resetGroup"
    :edit-translation="editTranslation"
    :show-import="showImport"
    :show-export="showExport"
    :next-step="nextStep"
    :previous-step="previousStep"
    :on-submit="onTranslationSubmit"
    :on-submit-export="onSubmitExport"
    :handle-import-file-upload="handleImportFileUpload"
    :translations="translations"
    :translation-default="translationDefault"
    :number-of-found-translations="numberOfFoundTranslations"
    :number-of-translations-to-review="numberOfTranslationsToReview"
    :number-of-successfully-imported-translations="numberOfSuccessfullyImportedTranslations"
    :number-of-successfully-updated-translations="numberOfSuccessfullyUpdatedTranslations"
    :translations-to-import="translationsToImport"
    :imported-file="importedFile"
    :format-date="formatDate"
    :format-datetime="formatDatetime"
    :format-time="formatTime"
  ></slot>
</template>

<script>
import { defineComponent, ref, reactive, computed, watch } from 'vue';
import { useBaseListing } from '../composables/useBaseListing.js';
import { useForm } from 'vee-validate';
import { notify } from '@kyvg/vue3-notification';
import axios from 'axios';

export default defineComponent({
  name: 'TranslationListing',
  props: {
    url: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      default: null,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    trans: {
      type: Object,
      default: () => ({}),
    },
    label: {
      type: String,
      default: 'All groups',
    },
    stepCount: {
      type: Number,
      default: 3,
    },
    locales: {
      type: [Object, Array],
      default: () => ({}),
    },
  },
  setup(props) {
    const listing = useBaseListing(props);
    const { validate } = useForm();

    const templateChecked = ref(false);
    const exportMultiselect = reactive({});
    Object.values(props.locales).forEach((value) => {
      exportMultiselect[value] = true;
    });

    const languagesToExport = ref([...Object.values(props.locales)]);
    const importLanguage = ref('');
    const file = ref(null);
    const onlyMissing = ref(false);
    const currentStep = ref(1);
    const scanning = ref(false);
    const translationId = ref(null);
    const translationDefault = ref('');
    const numberOfSuccessfullyImportedTranslations = ref(0);
    const numberOfSuccessfullyUpdatedTranslations = ref(0);
    const numberOfFoundTranslations = ref(0);
    const numberOfTranslationsToReview = ref(0);
    const translationsToImport = ref(null);
    const translations = reactive({});
    const importedFile = ref(null);

    // Override filters to include group
    listing.filters.group = null;

    watch(
      exportMultiselect,
      (newVal) => {
        languagesToExport.value = [];
        Object.keys(newVal).forEach((key) => {
          if (newVal[key]) {
            languagesToExport.value.push(key);
          }
        });
      },
      { deep: true }
    );

    const filteredGroup = computed(() => {
      return listing.filters.group === null ? props.label : listing.filters.group;
    });

    const lastStep = computed(() => {
      return currentStep.value === props.stepCount;
    });

    function rescan(url) {
      scanning.value = true;
      axios.post(url).then(
        () => {
          scanning.value = false;
          listing.loadData(true);
        },
        () => {
          scanning.value = false;
          notify({ type: 'error', title: 'Error!', text: 'An error has occured.' });
        }
      );
    }

    function filterGroup(group) {
      listing.filters.group = group;
      listing.loadData(true);
    }

    function resetGroup() {
      listing.filters.group = null;
      listing.loadData(true);
    }

    function editTranslation(item) {
      translationId.value = item.id;
      translationDefault.value = item.key;
      Object.keys(translations).forEach((key) => delete translations[key]);
      for (const key of Object.keys(item.text)) {
        translations[key] = item.text[key];
      }
    }

    function showImport() {
      // Consumer handles modal show
    }

    function showExport() {
      // Consumer handles modal show
    }

    async function nextStep() {
      if (currentStep.value === 1) {
        const { valid } = await validate();
        if (!valid) {
          notify({ type: 'error', title: 'Error!', text: 'The form contains invalid fields.' });
          return false;
        }

        const url = '/admin/translations/import';
        const formData = new FormData();

        formData.append('fileImport', file.value);
        formData.append('importLanguage', importLanguage.value);
        formData.append('onlyMissing', onlyMissing.value);

        try {
          const response = await axios.post(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          if (
            response.data.hasOwnProperty('numberOfImportedTranslations') &&
            response.data.hasOwnProperty('numberOfUpdatedTranslations')
          ) {
            currentStep.value = 3;
            numberOfSuccessfullyImportedTranslations.value = response.data.numberOfImportedTranslations;
            numberOfSuccessfullyUpdatedTranslations.value = response.data.numberOfUpdatedTranslations;
            listing.loadData();
          } else {
            currentStep.value = 2;
            numberOfFoundTranslations.value = Object.keys(response.data).length;
            translationsToImport.value = response.data;

            for (let i = 0; i < translationsToImport.value.length; i++) {
              if (translationsToImport.value[i].has_conflict) {
                numberOfTranslationsToReview.value++;
              }
            }
          }
        } catch (error) {
          if (error.response?.data === 'Wrong syntax in your import')
            notify({ type: 'error', title: 'Error!', text: 'Wrong syntax in your import.' });
          else if (error.response?.data === 'Unsupported file type')
            notify({ type: 'error', title: 'Error!', text: 'Unsupported file type.' });
          else notify({ type: 'error', title: 'Error!', text: 'An error has occured.' });
        }
      } else if (currentStep.value === 2) {
        const { valid } = await validate();
        if (!valid) {
          notify({ type: 'error', title: 'Error!', text: 'The form contains invalid fields.' });
          return false;
        }

        for (let i = 0; i < translationsToImport.value.length; i++) {
          if (translationsToImport.value[i].checkedCurrent) {
            translationsToImport.value[i][importLanguage.value.toLowerCase()] =
              translationsToImport.value[i].current_value;
          }
        }

        const url = '/admin/translations/import/conflicts';
        const data = {
          importLanguage: importLanguage.value,
          resolvedTranslations: translationsToImport.value,
        };

        try {
          const response = await axios.post(url, data);
          currentStep.value = 3;
          numberOfSuccessfullyImportedTranslations.value = response.data.numberOfImportedTranslations;
          numberOfSuccessfullyUpdatedTranslations.value = response.data.numberOfUpdatedTranslations;
          listing.loadData();
        } catch {
          notify({ type: 'error', title: 'Error!', text: 'An error has occured.' });
        }
      }
    }

    function previousStep() {
      currentStep.value--;
    }

    async function onTranslationSubmit() {
      const url = '/admin/translations/' + translationId.value;
      const data = { text: { ...translations } };

      try {
        await axios.post(url, data);
        notify({ type: 'success', title: 'Success!', text: 'Item successfully changed.' });
        listing.loadData();
      } catch {
        notify({ type: 'error', title: 'Error!', text: 'An error has occured.' });
      }
    }

    async function onSubmitExport() {
      const { valid } = await validate();
      if (!valid) {
        notify({ type: 'error', title: 'Error!', text: 'The form contains invalid fields.' });
        return false;
      }

      const params = new URLSearchParams();
      languagesToExport.value.forEach((lang) => {
        params.append('exportLanguages[]', lang);
      });

      const url = '/admin/translations/export?' + params.toString();
      window.location = url;
    }

    function handleImportFileUpload(e) {
      file.value = e.target.files[0];
      importedFile.value = e.target.files[0];
    }

    function onCloseImportModal() {
      currentStep.value = 1;
      importedFile.value = '';
      importLanguage.value = '';
      onlyMissing.value = false;
      translationsToImport.value = null;
    }

    return {
      ...listing,
      templateChecked,
      exportMultiselect,
      languagesToExport,
      importLanguage,
      onlyMissing,
      currentStep,
      scanning,
      translationId,
      translationDefault,
      numberOfSuccessfullyImportedTranslations,
      numberOfSuccessfullyUpdatedTranslations,
      numberOfFoundTranslations,
      numberOfTranslationsToReview,
      translationsToImport,
      translations,
      importedFile,
      filteredGroup,
      lastStep,
      rescan,
      filterGroup,
      resetGroup,
      editTranslation,
      showImport,
      showExport,
      nextStep,
      previousStep,
      onTranslationSubmit,
      onSubmitExport,
      handleImportFileUpload,
      onCloseImportModal,
    };
  },
});
</script>
