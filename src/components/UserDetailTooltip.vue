<template>
  <VDropdown
    class="avatar-tooltip-trigger"
    :triggers="['click']"
    :placement="placement"
    :distance="5"
    :auto-hide="true"
  >
    <img
      :src="user.avatar_thumb_url"
      class="avatar-photo"
      :alt="user.full_name"
      v-if="user.avatar_thumb_url"
    />
    <div class="avatar-initials" v-if="!user.avatar_thumb_url">
      {{ abbr }}
    </div>

    <div class="avatar-full-name" v-if="options.showFullNameLabel">
      {{ user.full_name }}
      <span v-if="edit && datetime !== ''">
        <br />
        <span class="user-info-span">{{ datetime }}</span>
      </span>
    </div>

    <template #popper>
      <div class="user-avatar">
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

      <div class="user-info">
        <h3>
          {{ user.full_name }}
          <small v-if="userText">
            | <strong style="text-transform: uppercase">{{ userText }}</strong>
          </small>
        </h3>
        <a v-if="user.email" :href="'mailto:' + user.email">{{ user.email }}</a>

        <slot></slot>
      </div>
    </template>
  </VDropdown>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { Dropdown as VDropdown } from 'floating-vue';

export default defineComponent({
  name: 'UserDetailTooltip',
  components: {
    VDropdown,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
    userText: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    options: {
      type: Object,
      default: () => ({
        showFullNameLabel: true,
      }),
    },
    placement: {
      type: String,
      default: 'top',
    },
    edit: {
      type: Boolean,
      default: false,
    },
    datetime: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const abbr = computed(() => {
      return `${props.user.first_name.slice(0, 1)}${props.user.last_name.slice(0, 1)}`;
    });

    return { abbr };
  },
});
</script>
