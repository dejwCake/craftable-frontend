<template>
    <button type="submit" class="btn btn-primary submit-btn" :disabled="submiting">
        <i class="fa" :class="submiting ? 'fa-spinner' : 'fa-download'"></i>
        {{ label }}
    </button>
</template>

<script setup>
defineProps({
    submiting: { type: Boolean, default: false },
    label: { type: String, default: 'Save' },
});
</script>
