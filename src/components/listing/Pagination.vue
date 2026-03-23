<template>
    <div v-if="pagination.total > 0" class="row">
        <div class="col-sm">
            <span class="pagination-caption">{{ overview }}</span>
        </div>
        <div class="col-sm-auto">
            <nav>
                <ul v-if="pagination.last_page > 1" :class="['pagination', sizeClass]">
                    <li v-if="showPrevious()" :class="{ disabled: pagination.current_page <= 1, 'page-item': true }">
                        <span v-if="pagination.current_page <= 1" class="page-link">
                            <span aria-hidden="true">{{ translations.previous }}</span>
                        </span>

                        <a
                            v-if="pagination.current_page > 1"
                            href="#"
                            :aria-label="translations.previous"
                            class="page-link"
                            @click.prevent="changePage(pagination.current_page - 1)"
                        >
                            <span aria-hidden="true">{{ translations.previous }}</span>
                        </a>
                    </li>

                    <li
                        v-for="num in array"
                        :key="num"
                        :class="{ active: num === pagination.current_page, 'page-item': true }"
                    >
                        <a href="#" class="page-link" @click.prevent="changePage(num)">{{ num }}</a>
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
                            <span aria-hidden="true">{{ translations.next }}</span>
                        </span>

                        <a
                            v-if="pagination.current_page < pagination.last_page"
                            href="#"
                            :aria-label="translations.next"
                            class="page-link"
                            @click.prevent="changePage(pagination.current_page + 1)"
                        >
                            <span aria-hidden="true">{{ translations.next }}</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useCookies } from 'vue3-cookies';

const props = defineProps({
    pagination: { type: Object, required: true },
    options: { type: Object, default: () => ({}) },
    size: { type: String, default: '' },
    translations: {
        type: Object,
        default: () => ({
            previous: 'Previous',
            next: 'Next',
            overview: 'Displaying items from :from to :to of total :total items.',
        }),
    },
});

const emit = defineEmits(['page-change', 'per-page-change']);
const { cookies } = useCookies();

const overview = computed(() => {
    return (props.translations.overview || '')
        .replace(':from', props.pagination.from)
        .replace(':to', props.pagination.to)
        .replace(':total', props.pagination.total);
});

const config = computed(() => {
    return Object.assign(
        {
            offset: 3,
            alwaysShowPrevNext: false,
        },
        props.options,
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
            emit('per-page-change');
        }
    },
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
    emit('page-change', page);
}
</script>
