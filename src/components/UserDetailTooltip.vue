<template>
    <div class="user-detail-tooltip d-inline-flex align-items-center">
        <label v-if="label" class="col-form-label text-body-secondary me-2 mb-0">{{ label }} :</label>
        <Popper arrow click>
            <div class="d-inline-flex align-items-center cursor-pointer">
                <img
                    :src="user.avatar_thumb_url"
                    class="avatar-photo"
                    :alt="user.full_name"
                    v-if="user.avatar_thumb_url"
                />
                <div class="avatar-initials" v-else>
                    {{ abbr }}
                </div>

                <div class="avatar-trigger-text" v-if="options.showFullNameLabel">
                    <span class="avatar-full-name">{{ user.full_name }}</span>
                    <span v-if="datetime" class="d-block user-info-span">{{ datetime }}</span>
                </div>
            </div>

            <template #content>
                <div class="user-detail-popper d-flex align-items-center">
                    <div class="user-avatar flex-shrink-0">
                        <img
                            :src="user.avatar_thumb_url"
                            class="avatar-photo"
                            :alt="user.full_name"
                            v-if="user.avatar_thumb_url"
                        />
                        <div class="avatar-initials" v-else>
                            {{ abbr }}
                        </div>
                    </div>

                    <div class="user-info ms-3">
                        <h3>
                            {{ user.full_name }}
                            <small v-if="userText">
                                | <strong class="text-uppercase">{{ userText }}</strong>
                            </small>
                        </h3>
                        <a v-if="user.email" :href="'mailto:' + user.email">{{ user.email }}</a>
                        <p v-if="datetimeText">{{ datetimeText }}</p>
                    </div>
                </div>
            </template>
        </Popper>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import Popper from 'vue3-popper';

const props = defineProps({
    user: {
        type: Object,
        required: true,
    },
    userText: {
        type: String,
        default: '',
    },
    label: {
        type: String,
        default: '',
    },
    datetimeText: {
        type: String,
        default: '',
    },
    options: {
        type: Object,
        default: () => ({
            showFullNameLabel: true,
        }),
    },
    datetime: {
        type: String,
        default: '',
    },
});

const abbr = computed(() => {
    return `${props.user.first_name.slice(0, 1)}${props.user.last_name.slice(0, 1)}`;
});
</script>
