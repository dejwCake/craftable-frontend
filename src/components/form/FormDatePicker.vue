<template>
    <div class="mb-3 row align-items-center">
        <label :for="name" class="col-form-label text-md-end"
               :class="'col-md-3'">{{ label }}</label>
        <div :class="'col-md-9 col-xl-8'">
            <div class="input-group flex-nowrap">
                <span class="input-group-text"><i class="fa" :class="icon"></i></span>
                <VueDatePicker :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
                    v-bind="config" class="flatpickr datepicker-input" :class="{'is-invalid': error}"
                    :id="name" :name="name" :placeholder="placeholder || label"
                    :time-config="{
                        enableTimePicker: config.enableTimePicker ?? true,
                        enableSeconds: config.enableSeconds ?? false,
                    }"
                    :formats="{ input: config.format }" auto-apply :locale="config.locale"
                    :input-attrs="{ hideInputIcon: true, clearable: false }"
                ></VueDatePicker>
            </div>
            <div v-if="error" class="invalid-feedback d-block form-text">{{ error }}</div>
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
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.datepicker-input {
    flex: 1 1 0;
    min-width: 0;
}
</style>
