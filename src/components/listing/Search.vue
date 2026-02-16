<template>
  <form @submit.prevent="">
    <div class="row justify-content-md-between">
      <div class="col col-lg-7 col-xl-5 form-group">
        <div class="input-group">
          <input
            class="form-control"
            :placeholder="translations.search_placeholder"
            :value="search"
            @input="$emit('update:search', $event.target.value)"
            @keyup.enter="filterFn('search', $event.target.value)"
          />
          <button
            type="button"
            class="btn btn-primary"
            @click="filterFn('search', search)"
          >
            <i class="fa fa-search"></i>&nbsp; {{ translations.search_btn }}
          </button>
        </div>
      </div>
      <div class="col-sm-auto form-group">
        <select
          class="form-control"
          :value="perPage"
          @change="$emit('update:perPage', +$event.target.value)"
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>
  </form>
</template>

<script setup>
defineProps({
  search: { type: String, default: '' },
  perPage: { type: [Number, String], default: 10 },
  filterFn: { type: Function, required: true },
  translations: {
    type: Object,
    default: () => ({ search_placeholder: 'Search...', search_btn: 'Search' }),
  },
});

defineEmits(['update:search', 'update:perPage']);
</script>
