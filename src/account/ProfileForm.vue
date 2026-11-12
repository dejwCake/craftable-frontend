<template>
    <form class="form-horizontal" method="post" :action="action" novalidate @submit.prevent="onSubmit">
        <div class="card">
            <div class="card-header"><i class="fa fa-pencil"></i> {{ translations.form_title }}</div>

            <div class="card-body">
                <div class="row">
                    <div v-if="hasAvatar" class="col-md-4 text-center">
                        <div class="avatar-upload">
                            <MediaUpload
                                :ref="`${media.collection}_uploader`"
                                :collection="media.collection"
                                :url="media.url"
                                :max-number-of-files="media.maxNumberOfFiles"
                                :max-file-size-in-mb="media.maxFileSizeInMb"
                                :accepted-file-types="media.acceptedFileTypes"
                                :uploaded-media="media.uploadedMedia"
                            />
                        </div>
                    </div>
                    <div :class="hasAvatar ? 'col-md-8' : 'col-12'">
                        <FormInput
                            v-model="form.first_name"
                            name="first_name"
                            :label="translations.columns.first_name"
                            :error="errors.first_name"
                        />

                        <FormInput
                            v-model="form.last_name"
                            name="last_name"
                            :label="translations.columns.last_name"
                            :error="errors.last_name"
                        />

                        <FormEmail
                            v-model="form.email"
                            name="email"
                            :label="translations.columns.email"
                            :error="errors.email"
                        />

                        <FormInput
                            v-if="emailChanged"
                            v-model="form.current_password"
                            name="current_password"
                            type="password"
                            :label="translations.columns.current_password"
                            :error="errors.current_password"
                        />

                        <FormSelect
                            v-model="form.language"
                            name="language"
                            :label="translations.columns.language"
                            :error="errors.language"
                            :options="languageOptions"
                            :placeholder="translations.select_an_option"
                        />
                    </div>
                </div>
            </div>

            <div class="card-footer">
                <FormSubmit :submitting="submitting" :label="translations.save" />
            </div>
        </div>
    </form>
</template>

<script setup>
import { computed } from 'vue';
import {
    useBaseForm,
    mediaCollectionDefaults,
    FormEmail,
    FormInput,
    FormSelect,
    FormSubmit,
    MediaUpload,
} from '@dejwcake/craftable';

const props = defineProps({
    action: { type: String, required: true },
    data: { type: Object, default: () => ({}) },
    translations: { type: Object, default: () => ({ columns: {} }) },
    languageOptions: { type: Array, default: () => [] },
    // Without `media.url` (admin model without an avatar collection) the uploader is hidden.
    // Defaults are read lazily: this file and the package entry point import each other.
    media: { type: Object, default: () => ({ ...mediaCollectionDefaults, collection: 'avatar' }) },
    responsiveBreakpoint: { type: Number, default: 850 },
});

const hasAvatar = Boolean(props.media?.url);

const loadedEmail = props.data?.email ?? '';

const emailChanged = computed(() => (form.value.email ?? '') !== loadedEmail);

const { form, submitting, errors, mediaCollections, onSubmit } = useBaseForm(props, {
    validationSchema: {
        email: 'required|email',
        language: 'required',
    },
    transformData(data) {
        if (!emailChanged.value) {
            delete data.current_password;
        }

        return data;
    },
});

mediaCollections.value = hasAvatar ? [props.media.collection] : [];

if (!props.data || Object.keys(props.data).length === 0) {
    form.value = {
        first_name: '',
        last_name: '',
        email: '',
        language: '',
    };
}
</script>
