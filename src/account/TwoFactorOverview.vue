<template>
    <div class="two-factor-overview">
        <div class="card mb-3">
            <div class="card-header"><i class="fa fa-shield-halved"></i> {{ translations.title }}</div>
            <div class="card-body">
                <p class="two-factor-overall mb-0">
                    <span class="badge" :class="activeNames.length ? 'bg-success' : 'bg-secondary'">
                        {{ activeNames.length ? translations.status_on : translations.status_off }}
                    </span>
                    <span v-if="activeNames.length" class="ms-2 text-body-secondary two-factor-active-via">
                        {{ activeVia }}
                    </span>
                </p>
            </div>
        </div>

        <div v-if="required && !activeNames.length" class="alert alert-info two-factor-enrolment-required">
            {{ translations.enrolment_required }}
        </div>

        <div v-for="factor in items" :key="factor.key" class="mb-3" :class="`two-factor-factor-${factor.key}`">
            <component
                :is="factor.component"
                v-if="factor.available && factor.component"
                v-bind="factor.props"
                @update:active="(active) => setActive(factor.key, active)"
            />

            <div v-else class="card">
                <div class="card-header"><i :class="factor.icon"></i> {{ factor.name }}</div>
                <div class="card-body">
                    <div v-if="!factor.available" class="alert alert-warning mb-0 two-factor-factor-notice">
                        {{ factor.notice }}
                    </div>
                    <template v-else>
                        <p class="two-factor-factor-status">
                            <span class="badge" :class="factor.active ? 'bg-success' : 'bg-secondary'">
                                {{ factor.status }}
                            </span>
                        </p>
                        <a v-if="factor.url" :href="factor.url" class="btn btn-outline-primary two-factor-factor-link">
                            {{ factor.link_label }}
                        </a>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
    // Each factor: key, name, icon, available, active, status, notice, url, link_label, and optionally a
    // registered component (with its props) that manages the factor in place and emits `update:active`.
    factors: { type: Array, default: () => [] },
    required: { type: Boolean, default: false },
    translations: {
        type: Object,
        default: () => ({
            title: 'Two-factor authentication',
            status_on: 'On',
            status_off: 'Off',
            active_via: 'Active: :factors',
            enrolment_required: 'Two-factor authentication is required for your account.',
        }),
    },
});

const items = ref(props.factors.map((factor) => ({ ...factor })));

const activeNames = computed(() =>
    items.value.filter((factor) => factor.available && factor.active).map((factor) => factor.name),
);

const activeVia = computed(() =>
    (props.translations.active_via || ':factors').replace(':factors', activeNames.value.join(', ')),
);

function setActive(key, active) {
    items.value = items.value.map((factor) => (factor.key === key ? { ...factor, active } : factor));
}
</script>
