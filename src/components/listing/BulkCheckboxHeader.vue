<template>
  <th class="bulk-checkbox">
    <input
      class="form-check-input"
      id="enabled"
      type="checkbox"
      :checked="isClickedAll"
      name="enabled_fake_element"
      @click="onToggleAll()"
    />
    <label class="form-check-label" for="enabled">
      #
    </label>
  </th>
</template>

<script setup>
defineProps({
  isClickedAll: { type: Boolean, required: true },
  onToggleAll: { type: Function, required: true },
});
</script>
