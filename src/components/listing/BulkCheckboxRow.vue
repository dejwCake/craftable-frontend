<template>
    <input
        class="form-check-input"
        :id="'enabled' + itemId"
        type="checkbox"
        :checked="checked"
        :name="'enabled' + itemId + '_fake_element'"
        @click="onToggle(itemId)"
        :disabled="disabled"
    />
    <label class="form-check-label" :for="'enabled' + itemId">
    </label>
</template>

<script setup>
defineProps({
    itemId: { type: [Number, String], required: true },
    checked: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    onToggle: { type: Function, required: true },
});
</script>
