<template>
    <div class="form-check form-switch form-switch-inline">
        <input
            class="form-check-input"
            :class="switchClass"
            type="checkbox"
            role="switch"
            :checked="!!modelValue"
            disabled
        />
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: { type: [Boolean, Number, String], default: false },
    variant: { type: String, default: 'success' },
});

const switchClass = computed(() => `form-switch-${props.variant}`);
</script>
