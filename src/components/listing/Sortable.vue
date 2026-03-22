<template>
  <th>
    <a @click.stop="sort(column)">
      <span
        class="fa"
        :class="{
          'fa-arrow-down-wide-short': orderBy.column === column && orderBy.direction === 'asc',
          'fa-arrow-down-short-wide': orderBy.column === column && orderBy.direction === 'desc',
        }"
      ></span>
      <slot></slot>
    </a>
  </th>
</template>

<script setup>
const props = defineProps({
  column: { type: String, required: true },
  orderBy: { type: Object, required: true },
  callback: { type: Function, required: true },
});

const emit = defineEmits(['sort']);

function sort(column) {
  const direction =
    props.orderBy.column === column
      ? props.orderBy.direction === 'asc' ? 'desc' : 'asc'
      : 'asc';

  props.orderBy.column = column;
  props.orderBy.direction = direction;
  emit('sort', { column, direction });
  props.callback();
}
</script>
