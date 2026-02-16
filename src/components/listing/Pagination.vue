<template>
  <nav>
    <ul :class="['pagination', sizeClass]" v-if="pagination.last_page > 1">
      <li v-if="showPrevious()" :class="{ disabled: pagination.current_page <= 1, 'page-item': true }">
        <span v-if="pagination.current_page <= 1" class="page-link">
          <span aria-hidden="true">{{ config.previousText }}</span>
        </span>

        <a
          href="#"
          v-if="pagination.current_page > 1"
          :aria-label="config.ariaPrevious"
          @click.prevent="changePage(pagination.current_page - 1)"
          class="page-link"
        >
          <span aria-hidden="true">{{ config.previousText }}</span>
        </a>
      </li>

      <li v-for="num in array" :key="num" :class="{ active: num === pagination.current_page, 'page-item': true }">
        <a href="#" @click.prevent="changePage(num)" class="page-link">{{ num }}</a>
      </li>

      <li
        v-if="showNext()"
        :class="{
          disabled: pagination.current_page === pagination.last_page || pagination.last_page === 0,
          'page-item': true,
        }"
      >
        <span
          v-if="pagination.current_page === pagination.last_page || pagination.last_page === 0"
          class="page-link"
        >
          <span aria-hidden="true">{{ config.nextText }}</span>
        </span>

        <a
          href="#"
          v-if="pagination.current_page < pagination.last_page"
          :aria-label="config.ariaNext"
          @click.prevent="changePage(pagination.current_page + 1)"
          class="page-link"
        >
          <span aria-hidden="true">{{ config.nextText }}</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script>
import { defineComponent, computed, watch } from 'vue';
import { useCookies } from 'vue3-cookies';

export default defineComponent({
  name: 'CraftablePagination',
  props: {
    pagination: {
      type: Object,
      required: true,
    },
    callback: {
      type: Function,
      required: true,
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    size: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { cookies } = useCookies();

    const config = computed(() => {
      return Object.assign(
        {
          offset: 3,
          ariaPrevious: 'Previous',
          ariaNext: 'Next',
          previousText: '\u00AB',
          nextText: '\u00BB',
          alwaysShowPrevNext: false,
        },
        props.options
      );
    });

    const array = computed(() => {
      if (props.pagination.last_page <= 0) {
        return [];
      }

      let from = props.pagination.current_page - config.value.offset;
      if (from < 1) {
        from = 1;
      }

      let to = from + config.value.offset * 2;
      if (to >= props.pagination.last_page) {
        to = props.pagination.last_page;
      }

      const arr = [];
      while (from <= to) {
        arr.push(from);
        from++;
      }

      return arr;
    });

    const sizeClass = computed(() => {
      if (props.size === 'large') {
        return 'pagination-lg';
      } else if (props.size === 'small') {
        return 'pagination-sm';
      }
      return '';
    });

    watch(
      () => props.pagination.per_page,
      (newVal, oldVal) => {
        if (+newVal !== +oldVal) {
          cookies.set('per_page', newVal);
          props.callback();
        }
      }
    );

    function showPrevious() {
      return config.value.alwaysShowPrevNext || props.pagination.current_page > 1;
    }

    function showNext() {
      return config.value.alwaysShowPrevNext || props.pagination.current_page < props.pagination.last_page;
    }

    function changePage(page) {
      if (props.pagination.current_page === page) {
        return;
      }

      props.pagination.current_page = page;
      props.callback();
    }

    return {
      config,
      array,
      sizeClass,
      showPrevious,
      showNext,
      changePage,
    };
  },
});
</script>
