<template>
    <form class="form-horizontal" method="post" :action="action" novalidate @submit.prevent="onSubmit">
        <div class="card">
            <div class="card-header"><i class="fa fa-pencil"></i> {{ translations.form_title }}</div>

            <div class="card-body">
                <FormInput
                    v-model="form.current_password"
                    name="current_password"
                    type="password"
                    :label="translations.columns.current_password"
                    :error="errors.current_password"
                />

                <FormPasswordConfirm
                    v-model:password="form.password"
                    v-model:password-confirmation="form.password_confirmation"
                    :password-error="errors.password"
                    :confirmation-error="errors.password_confirmation"
                    :translations="translations.columns"
                />
            </div>

            <div class="card-footer">
                <FormSubmit :submitting="submitting" :label="translations.save" />
            </div>
        </div>
    </form>
</template>

<script setup>
import { useBaseForm, FormInput, FormPasswordConfirm, FormSubmit } from '@dejwcake/craftable';

const props = defineProps({
    action: { type: String, required: true },
    translations: { type: Object, default: () => ({ columns: {} }) },
    responsiveBreakpoint: { type: Number, default: 850 },
});

// No `data` prop: the form never starts from stored values, and nothing but the three fields is posted.
const { form, submitting, errors, onSubmit } = useBaseForm(props, {
    validationSchema: {
        current_password: 'required',
        password: 'required|min:8',
        password_confirmation: 'required|confirmed:@password',
    },
});

form.value = {
    current_password: '',
    password: '',
    password_confirmation: '',
};
</script>
