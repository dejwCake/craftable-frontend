<template>
    <div class="mb-3 row align-items-center">
        <label class="col-md-3 col-form-label text-md-end">{{ label }}</label>
        <div class="col-md-9 col-xl-8">
            <slot>
                <span>{{ value }}</span>
            </slot>
        </div>
    </div>
</template>

<script setup>
defineProps({
    label: { type: String, required: true },
    value: { type: [String, Number, Boolean], default: '' },
});
</script>
