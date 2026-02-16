<template>
    <div class="form-group row align-items-center">
        <label :for="name" class="col-form-label text-md-end"
               :class="isFormLocalized ? 'col-md-4' : 'col-md-3'">{{ label }}</label>
        <div :class="isFormLocalized ? 'col-md-4' : 'col-md-9 col-xl-7'">
            <div class="input-group">
                <span class="input-group-text"><i class="fa" :class="icon"></i></span>
                <VueDatePicker :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
                    v-bind="config" class="flatpickr" :class="{'is-invalid': error}"
                    :id="name" :name="name" :placeholder="placeholder || label"></VueDatePicker>
            </div>
            <div v-if="error" class="invalid-feedback form-text" style="display: block">{{ error }}</div>
        </div>
    </div>
</template>

<script setup>
import { VueDatePicker } from '@vuepic/vue-datepicker';

defineProps({
    modelValue: { type: [String, Date, Object], default: '' },
    name: { type: String, required: true },
    label: { type: String, required: true },
    error: { type: String, default: '' },
    config: { type: Object, required: true },
    icon: { type: String, default: 'fa-calendar' },
    placeholder: { type: String, default: '' },
    isFormLocalized: { type: Boolean, default: false },
});

defineEmits(['update:modelValue']);
</script>
