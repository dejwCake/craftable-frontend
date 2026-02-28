<template>
    <button type="submit" class="btn btn-primary submit-btn" :disabled="submitting">
        <i class="fa" :class="submitting ? 'fa-spinner' : 'fa-download'"></i>
        {{ label }}
    </button>
</template>

<script setup>
defineProps({
    submitting: { type: Boolean, default: false },
    label: { type: String, default: 'Save' },
});
</script>
