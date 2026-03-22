<template>
    <input
        :id="'enabled' + itemId"
        class="form-check-input"
        type="checkbox"
        :checked="checked"
        :name="'enabled' + itemId + '_fake_element'"
        :disabled="disabled"
        @click="onToggle(itemId)"
    />
    <label class="form-check-label" :for="'enabled' + itemId"> </label>
</template>

<script setup>
defineProps({
    itemId: { type: [Number, String], required: true },
    checked: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    onToggle: { type: Function, required: true },
});
</script>
