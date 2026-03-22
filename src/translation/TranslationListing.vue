<template>
    <div class="row">
        <div class="col">
            <TranslationEditModal
                :show="showEditModal"
                :item="editItem"
                :locales="localeList"
                :url="url"
                :translations="translations"
                @close="showEditModal = false"
                @saved="loadData"
            />

            <TranslationImportModal
                :show="showImportModal"
                :locales="localeList"
                :url="url"
                :step-count="stepCount"
                :translations="translations"
                @close="showImportModal = false"
                @imported="loadData"
            />

            <TranslationExportModal
                :show="showExportModal"
                :locales="localeList"
                :url="url"
                :translations="translations"
                @close="showExportModal = false"
            />

            <!-- Main card -->
            <div class="card">
                <div class="card-header">
                    <i class="fa fa-align-justify"></i> {{ translations.title }}
                    <a
                        class="btn btn-primary btn-sm float-end ms-2"
                        href="#"
                        role="button"
                        @click.prevent="showImportModal = true"
                    >
                        <i class="fa fa-upload"></i>&nbsp; {{ translations.import_btn }}
                    </a>
                    <a
                        class="btn btn-primary btn-sm float-end ms-2"
                        href="#"
                        role="button"
                        @click.prevent="showExportModal = true"
                    >
                        <i class="fa fa-file-excel"></i>&nbsp; {{ translations.export_btn }}
                    </a>
                    <a class="btn btn-primary btn-sm float-end" href="#" role="button" @click.prevent="rescan">
                        <i class="fa" :class="scanning ? 'fa-spinner fa-spin' : 'fa-eye'"></i>&nbsp;
                        {{ translations.rescan_btn }}
                    </a>
                </div>
                <div ref="cardBody" class="card-body">
                    <div class="row justify-content-md-between mb-3">
                        <div class="col col-lg-7 col-xl-5 mb-3">
                            <Search
                                v-model:search="search"
                                :filter-fn="filter"
                                :translations="{
                                    search_placeholder: translations.search_placeholder,
                                    search_btn: translations.search_btn,
                                }"
                            >
                                <template #prepend>
                                    <Multiselect
                                        :model-value="filters.group"
                                        :options="groups"
                                        :placeholder="translations.all_groups"
                                        :allow-empty="true"
                                        :show-labels="false"
                                        open-direction="bottom"
                                        class="multiselect--input-group-prepend"
                                        @update:model-value="onGroupSelect"
                                    />
                                </template>
                            </Search>
                        </div>
                        <div class="col-sm-auto mb-3">
                            <PerPage v-model="pagination.state.per_page" />
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-hover table-listing">
                            <thead>
                                <tr>
                                    <Sortable :column="'group'" :order-by="orderBy" :callback="loadData">{{
                                        translations.group
                                    }}</Sortable>
                                    <Sortable :column="'key'" :order-by="orderBy" :callback="loadData">{{
                                        translations.default
                                    }}</Sortable>
                                    <Sortable :column="'text'" :order-by="orderBy" :callback="loadData">{{
                                        userLocale.toUpperCase()
                                    }}</Sortable>
                                    <Sortable
                                        v-if="isColumnVisible(4)"
                                        :column="'created_at'"
                                        :order-by="orderBy"
                                        :callback="loadData"
                                        >{{ translations.created_at_label }}</Sortable
                                    >
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in collection" :key="item.id">
                                    <td>{{ item.group }}</td>
                                    <td>{{ item.key }}</td>
                                    <td>{{ item.text?.[userLocale] }}</td>
                                    <td v-if="isColumnVisible(4)">{{ formatDate(item.created_at) }}</td>
                                    <td>
                                        <a
                                            class="btn btn-sm btn-info"
                                            href="#"
                                            :title="translations.edit_btn"
                                            role="button"
                                            @click.prevent="openEditModal(item)"
                                        >
                                            <i class="fa fa-edit"></i>
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        :pagination="pagination.state"
                        :callback="loadData"
                        :options="pagination.options"
                        :translations="{
                            previous: translations.pagination_previous,
                            next: translations.pagination_next,
                            overview: translations.pagination_overview,
                        }"
                    />

                    <div v-if="!collection?.length" class="no-items-found">
                        <i class="fa fa-magnifying-glass"></i>
                        <h3>{{ translations.no_items }}</h3>
                        <p>{{ translations.try_changing_items }}</p>
                        <a class="btn btn-primary" href="#" role="button" @click.prevent="rescan">
                            <i class="fa" :class="scanning ? 'fa-spinner fa-spin' : 'fa-eye'"></i>&nbsp;
                            {{ translations.rescan_btn }}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useBaseListing } from '../composables/useBaseListing.js';
import { useResponsiveColumns } from '../composables/useResponsiveColumns.js';
import { notifyError } from '../utils/notify.js';
import { formatDate } from '../utils/dateFormatters.js';
import Multiselect from 'vue-multiselect';
import Sortable from '../components/listing/Sortable.vue';
import Pagination from '../components/listing/Pagination.vue';
import PerPage from '../components/listing/PerPage.vue';
import Search from '../components/listing/Search.vue';
import TranslationEditModal from './modals/TranslationEditModal.vue';
import TranslationImportModal from './modals/TranslationImportModal.vue';
import TranslationExportModal from './modals/TranslationExportModal.vue';

const axios = window.axios;

const props = defineProps({
    url: { type: String, required: true },
    data: { type: Object, default: null },
    timezone: { type: String, default: 'UTC' },
    locales: { type: [Object, Array], default: () => [] },
    userLocale: { type: String, default: 'en' },
    groups: { type: Array, default: () => [] },
    translations: { type: Object, default: () => ({}) },
    stepCount: { type: Number, default: 3 },
});

const cardBody = ref(null);
const { isColumnVisible } = useResponsiveColumns(cardBody);

const { pagination, orderBy, filters, search, collection, loadData, filter } = useBaseListing(props);

const localeList = computed(() => (Array.isArray(props.locales) ? props.locales : Object.values(props.locales)));

// Modal state
const showEditModal = ref(false);
const showImportModal = ref(false);
const showExportModal = ref(false);
const editItem = ref(null);

// Group filter
filters.group = null;

function onGroupSelect(val) {
    filters.group = val ?? null;
    loadData(true);
}

function openEditModal(item) {
    editItem.value = item;
    showEditModal.value = true;
}

// Rescan
const scanning = ref(false);

function rescan() {
    scanning.value = true;
    axios.post(props.url + '/rescan').then(
        () => {
            scanning.value = false;
            loadData(true);
        },
        () => {
            scanning.value = false;
            notifyError();
        },
    );
}
</script>
