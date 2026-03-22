<template>
    <div class="modal fade" :class="{ show: show }" :style="{ display: show ? 'block' : 'none' }">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">{{ translations.edit }}</h4>
                    <button type="button" class="btn-close" @click="emit('close')"></button>
                </div>
                <div class="modal-body">
                    <p class="text-center" style="word-wrap: break-word;">
                        <strong>{{ translations.default_text }}:</strong> {{ item?.key }}
                    </p>
                    <form @submit.prevent="onSubmit">
                        <div v-for="locale in localeList" :key="locale" class="mb-3">
                            <label class="form-label">{{ locale.toUpperCase() }} {{ translations.translation }}</label>
                            <input
                                v-if="!translationValues[locale] || translationValues[locale].length < 70"
                                type="text" class="form-control"
                                :placeholder="(translations.translation_for || '').replace(':locale', locale)"
                                v-model="translationValues[locale]"
                            >
                            <textarea
                                v-else
                                class="form-control"
                                :placeholder="(translations.translation_for || '').replace(':locale', locale)"
                                v-model="translationValues[locale]"
                                cols="30" rows="4"
                            ></textarea>
                        </div>
                        <div class="text-center">
                            <button class="btn btn-primary w-100" type="submit">
                                {{ translations.save }} {{ translations.translation }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show" v-if="show" @click="emit('close')"></div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue';
import { notifySuccess, notifyError } from '../../utils/notify.js';

const axios = window.axios;

const props = defineProps({
    show: { type: Boolean, default: false },
    item: { type: Object, default: null },
    locales: { type: [Object, Array], default: () => [] },
    url: { type: String, required: true },
    translations: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['close', 'saved']);

const localeList = computed(() =>
    Array.isArray(props.locales) ? props.locales : Object.values(props.locales)
);

const translationValues = reactive({});

watch(() => props.item, (item) => {
    Object.keys(translationValues).forEach(key => delete translationValues[key]);
    for (const key of Object.keys(item?.text || {})) {
        translationValues[key] = item.text[key];
    }
}, { immediate: true });

async function onSubmit() {
    try {
        await axios.post(props.url + '/' + props.item.id, { text: { ...translationValues } });
        notifySuccess('Item successfully changed.');
        emit('saved');
        emit('close');
    } catch {
        notifyError();
    }
}
</script>
