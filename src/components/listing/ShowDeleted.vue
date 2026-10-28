<template>
    <label class="d-inline-flex align-items-center gap-2 mb-0 text-nowrap text-reset">
        <span class="form-check form-switch form-switch-inline mb-0">
            <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                :checked="modelValue"
                @change="$emit('update:modelValue', $event.target.checked)"
            />
        </span>
        {{ translations.show_deleted }}
    </label>
</template>

<script setup>
defineProps({
    modelValue: { type: Boolean, default: false },
    translations: {
        type: Object,
        default: () => ({
            show_deleted: 'Show deleted',
        }),
    },
});

defineEmits(['update:modelValue']);
</script>
