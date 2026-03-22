<template>
    <input
        id="enabled"
        class="form-check-input"
        type="checkbox"
        :checked="isClickedAll"
        name="enabled_fake_element"
        @click="onToggleAll()"
    />
    <label class="form-check-label" for="enabled"> # </label>
</template>

<script setup>
defineProps({
    isClickedAll: { type: Boolean, required: true },
    onToggleAll: { type: Function, required: true },
});
</script>
