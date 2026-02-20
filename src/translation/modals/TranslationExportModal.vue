<template>
    <div class="modal fade" :class="{ show: show }" :style="{ display: show ? 'block' : 'none' }">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">{{ translations.export }}</h4>
                    <button type="button" class="btn-close" @click="$emit('close')"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="onSubmit">
                        <p class="text-start">{{ translations.export_notice }}</p>

                        <FormMultiSelect
                            v-model="languagesToExport"
                            name="languagesToExport"
                            :label="translations.language_to_export"
                            :options="localeOptions"
                            track-by="id"
                            option-label="name"
                            :placeholder="translations.select_language"
                        />

                        <div class="text-end">
                            <button class="btn btn-primary" type="submit">
                                <i class="fa fa-file-excel"></i>&nbsp;{{ translations.export_btn }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show" v-if="show" @click="$emit('close')"></div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { notifyError } from '../../utils/notify.js';
import FormMultiSelect from '../../components/form/FormMultiSelect.vue';

const props = defineProps({
    show: { type: Boolean, default: false },
    locales: { type: [Object, Array], default: () => [] },
    url: { type: String, required: true },
    translations: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['close']);

const localeList = computed(() =>
    Array.isArray(props.locales) ? props.locales : Object.values(props.locales)
);

const localeOptions = computed(() =>
    localeList.value.map(l => ({ id: l, name: l.toUpperCase() }))
);

const languagesToExport = ref([]);

watch(localeOptions, (opts) => {
    languagesToExport.value = [...opts];
}, { immediate: true });

function onSubmit() {
    if (languagesToExport.value.length === 0) {
        notifyError('Please select at least one language to export.');
        return;
    }
    const params = new URLSearchParams();
    languagesToExport.value.forEach(l => params.append('exportLanguages[]', l.id));
    window.location = props.url + '/export?' + params.toString();
    emit('close');
}
</script>
