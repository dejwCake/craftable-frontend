<template>
    <div class="input-group">
        <slot name="prepend" />
        <div class="form-control d-flex align-items-center p-0">
            <input
                ref="inputRef"
                class="border-0 shadow-none ps-3 flex-grow-1"
                style="outline: none; min-width: 0"
                :placeholder="translations.search_placeholder"
                :value="search"
                @input="onInput"
                @keyup.enter="onEnter"
            />
            <button
                v-if="search"
                type="button"
                class="border-0 bg-transparent pe-1 ps-0 flex-shrink-0 text-danger"
                @click="clearSearch"
            >
                <i class="fa fa-times"></i>
            </button>
        </div>
        <button type="button" class="btn btn-primary" @click="doSearch">
            <i class="fa fa-search"></i>&nbsp; {{ translations.search_btn }}
        </button>
    </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue';

const props = defineProps({
    search: { type: String, default: '' },
    debounce: { type: Number, default: 400 },
    filterFn: { type: Function, required: true },
    translations: {
        type: Object,
        default: () => ({ search_placeholder: 'Search...', search_btn: 'Search' }),
    },
});

const emit = defineEmits(['update:search']);
const inputRef = ref(null);
let debounceTimer = null;

function cancelDebounce() {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }
}

function onInput(event) {
    const value = event.target.value;
    emit('update:search', value);
    cancelDebounce();
    debounceTimer = setTimeout(() => {
        props.filterFn('search', value);
    }, props.debounce);
}

function doSearch() {
    cancelDebounce();
    props.filterFn('search', props.search);
}

function onEnter() {
    cancelDebounce();
    const value = inputRef.value?.value ?? props.search;
    emit('update:search', value);
    props.filterFn('search', value);
}

function clearSearch() {
    cancelDebounce();
    emit('update:search', '');
    props.filterFn('search', '');
}

onBeforeUnmount(cancelDebounce);
</script>
