<template>
    <Teleport to="body">
        <div v-if="show" class="modal-backdrop fade show" @click="$emit('cancel')"></div>
        <div
            v-if="show"
            class="modal fade show d-block"
            tabindex="-1"
            role="dialog"
            @click.self="$emit('cancel')"
        >
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i :class="iconClass" class="me-2"></i>
                            {{ translations.confirm_title }}
                        </h5>
                        <button type="button" class="btn-close" @click="$emit('cancel')"></button>
                    </div>
                    <div class="modal-body">
                        <p>{{ translations.confirm_text }}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
                            {{ translations.cancel_btn }}
                        </button>
                        <button type="button" :class="btnClass" @click="$emit('confirm')">
                            {{ translations.confirm_btn }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    show: { type: Boolean, default: false },
    variant: {
        type: String,
        default: 'danger',
        validator: (v) => ['danger', 'success', 'primary', 'warning'].includes(v),
    },
    translations: {
        type: Object,
        default: () => ({
            confirm_title: 'Warning!',
            confirm_text: 'Are you sure?',
            confirm_btn: 'Yes, confirm',
            cancel_btn: 'Cancel',
        }),
    },
});

const btnClass = computed(() => {
    const base = `btn btn-${props.variant}`;
    return ['success', 'primary'].includes(props.variant) ? `${base} text-white` : base;
});

const iconClass = computed(() => {
    if (props.variant === 'danger') return 'fa fa-triangle-exclamation text-danger';
    if (props.variant === 'warning') return 'fa fa-triangle-exclamation text-warning';
    if (props.variant === 'success') return 'fa fa-circle-check text-success';
    return 'fa fa-circle-question text-primary';
});

defineEmits(['confirm', 'cancel']);
</script>
