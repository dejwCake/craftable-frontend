<template>
    <div class="modal fade" :class="{ show: show }" :style="{ display: show ? 'block' : 'none' }">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">{{ translations.import_title }}</h4>
                    <button type="button" class="btn-close" @click="onClose"></button>
                </div>
                <div class="modal-body">
                    <div v-show="currentStep === 1">
                        <p>{{ translations.import_notice }}</p>
                        <div class="row mb-3">
                            <div class="col-md-4 text-md-end">
                                <label class="col-form-label">{{ translations.upload_file }}</label>
                            </div>
                            <div class="col-md-6">
                                <label class="btn btn-primary btn-sm w-100 mb-0">
                                    <span v-if="importedFile">{{ importedFile.name }}</span>
                                    <span v-else>{{ translations.choose_file }}</span>
                                    <input type="file" class="d-none" ref="fileInput" @change="handleFileUpload" accept=".xlsx">
                                </label>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-4 text-md-end">
                                <label for="importLanguage" class="col-form-label">{{ translations.language_to_import }}</label>
                            </div>
                            <div class="col-md-6">
                                <Multiselect
                                    v-model="importLanguageObj"
                                    :options="localeOptions"
                                    track-by="id"
                                    label="name"
                                    :placeholder="translations.select_language"
                                    :allow-empty="false"
                                    :show-labels="false"
                                    open-direction="bottom"
                                />
                            </div>
                        </div>
                        <div class="offset-md-4">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" v-model="onlyMissing" id="onlyMissingTranslations">
                                <label class="form-check-label" for="onlyMissingTranslations">{{ translations.do_not_override }}</label>
                            </div>
                        </div>
                    </div>

                    <div v-show="currentStep === 2">
                        <div class="text-center mb-3">
                            <p>{{ translations.conflict_found }} {{ numberOfFoundTranslations }}
                                {{ translations.conflict_to_import }} {{ numberOfTranslationsToReview }}
                                {{ translations.conflict_differ }}</p>
                        </div>
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>{{ translations.group }}</th>
                                    <th>{{ translations.default }}</th>
                                    <th>{{ translations.current_value }}</th>
                                    <th>{{ translations.imported_value }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-for="(item, index) in translationsToImport" :key="index">
                                    <tr v-if="item.has_conflict">
                                        <td style="word-break: break-all">{{ item.group }}</td>
                                        <td style="word-break: break-all">{{ item.default }}</td>
                                        <td style="word-break: break-all">
                                            <input type="radio" class="form-check-input me-1" :value="true"
                                                v-model="translationsToImport[index].checkedCurrent"
                                                :id="'current-' + index + '0'" :name="'current-' + index">
                                            <label class="form-check-label" :for="'current-' + index + '0'">{{ item.current_value }}</label>
                                        </td>
                                        <td style="word-break: break-all">
                                            <input type="radio" class="form-check-input me-1" :value="false"
                                                v-model="translationsToImport[index].checkedCurrent"
                                                :id="'current-' + index + '1'" :name="'current-' + index">
                                            <label class="form-check-label" :for="'current-' + index + '1'">{{ item[importLanguage.toLowerCase()] }}</label>
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>

                    <div v-show="currentStep === 3">
                        <div class="text-center">
                            <p>{{ numberOfSuccessfullyImportedTranslations }} {{ translations.successfully_imported }}
                                {{ numberOfSuccessfullyUpdatedTranslations }} {{ translations.successfully_updated }}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" v-if="!lastStep" class="btn btn-primary" @click.prevent="nextStep">
                        {{ translations.next }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show" v-if="show" @click="onClose"></div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { notifyError } from '../../utils/notify.js';
import Multiselect from 'vue-multiselect';

const axios = window.axios;

const props = defineProps({
    show: { type: Boolean, default: false },
    locales: { type: [Object, Array], default: () => [] },
    url: { type: String, required: true },
    stepCount: { type: Number, default: 3 },
    translations: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['close', 'imported']);

const localeList = computed(() =>
    Array.isArray(props.locales) ? props.locales : Object.values(props.locales)
);

const localeOptions = computed(() =>
    localeList.value.map(l => ({ id: l, name: l.toUpperCase() }))
);

const fileInput = ref(null);
const importedFile = ref(null);
const importLanguageObj = ref(null);
const importLanguage = computed(() => importLanguageObj.value?.id ?? '');
const onlyMissing = ref(false);
const currentStep = ref(1);
const numberOfSuccessfullyImportedTranslations = ref(0);
const numberOfSuccessfullyUpdatedTranslations = ref(0);
const numberOfFoundTranslations = ref(0);
const numberOfTranslationsToReview = ref(0);
const translationsToImport = ref(null);

const lastStep = computed(() => currentStep.value === props.stepCount);

watch(() => props.show, (val) => {
    if (!val) resetState();
});

function resetState() {
    currentStep.value = 1;
    importedFile.value = null;
    importLanguageObj.value = null;
    onlyMissing.value = false;
    translationsToImport.value = null;
    if (fileInput.value) {
        fileInput.value.value = '';
    }
}

function handleFileUpload(e) {
    importedFile.value = e.target.files[0];
}

function onClose() {
    emit('close');
}

async function nextStep() {
    if (currentStep.value === 1) {
        if (!importedFile.value || !importLanguage.value) {
            notifyError('The form contains invalid fields.');
            return;
        }

        const formData = new FormData();
        formData.append('fileImport', importedFile.value);
        formData.append('importLanguage', importLanguage.value);
        formData.append('onlyMissing', onlyMissing.value);

        try {
            const response = await axios.post(props.url + '/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if ('numberOfImportedTranslations' in response.data && 'numberOfUpdatedTranslations' in response.data) {
                currentStep.value = 3;
                numberOfSuccessfullyImportedTranslations.value = response.data.numberOfImportedTranslations;
                numberOfSuccessfullyUpdatedTranslations.value = response.data.numberOfUpdatedTranslations;
                emit('imported');
            } else {
                currentStep.value = 2;
                translationsToImport.value = response.data;
                numberOfFoundTranslations.value = Object.keys(response.data).length;
                numberOfTranslationsToReview.value = translationsToImport.value.filter(i => i.has_conflict).length;
            }
        } catch (error) {
            const msg = error.response?.data;
            if (msg === 'Wrong syntax in your import') notifyError('Wrong syntax in your import.');
            else if (msg === 'Unsupported file type') notifyError('Unsupported file type.');
            else notifyError();
        }
    } else if (currentStep.value === 2) {
        for (let i = 0; i < translationsToImport.value.length; i++) {
            if (translationsToImport.value[i].checkedCurrent) {
                translationsToImport.value[i][importLanguage.value.toLowerCase()] = translationsToImport.value[i].current_value;
            }
        }

        try {
            const response = await axios.post(props.url + '/import/conflicts', {
                importLanguage: importLanguage.value,
                resolvedTranslations: translationsToImport.value,
            });
            currentStep.value = 3;
            numberOfSuccessfullyImportedTranslations.value = response.data.numberOfImportedTranslations;
            numberOfSuccessfullyUpdatedTranslations.value = response.data.numberOfUpdatedTranslations;
            emit('imported');
        } catch {
            notifyError();
        }
    }
}
</script>
