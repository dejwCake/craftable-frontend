<template>
    <div class="card">
        <div class="card-header"><i class="fa fa-fingerprint"></i> {{ translations.title }}</div>

        <div class="card-body">
            <div v-if="!available" class="alert alert-warning passkeys-migration-missing">
                {{ translations.migration_missing }}
            </div>
            <div v-else-if="!supported" class="alert alert-info passkeys-unsupported">
                {{ translations.unsupported }}
            </div>
            <div v-if="generalError" class="alert alert-danger">{{ generalError }}</div>

            <p>{{ translations.description }}</p>

            <p v-if="!items.length" class="text-body-secondary passkeys-empty">{{ translations.empty }}</p>

            <ul v-else class="list-group mb-3 passkeys-list">
                <li v-for="passkey in items" :key="passkey.id" class="list-group-item passkeys-item">
                    <form v-if="renamingId === passkey.id" class="passkeys-rename" novalidate @submit.prevent="rename">
                        <FormInput
                            v-model="form.name"
                            name="rename_name"
                            :label="translations.name"
                            :error="errors.name"
                        />
                        <button
                            type="submit"
                            class="btn btn-primary btn-sm me-2 passkeys-rename-save"
                            :disabled="submitting"
                        >
                            {{ translations.save }}
                        </button>
                        <button type="button" class="btn btn-link btn-sm passkeys-cancel" @click="reset">
                            {{ translations.cancel }}
                        </button>
                    </form>

                    <form
                        v-else-if="removingId === passkey.id"
                        class="passkeys-remove"
                        novalidate
                        @submit.prevent="remove"
                    >
                        <p class="mb-2">{{ translations.remove_confirm }}</p>
                        <FormInput
                            v-model="form.current_password"
                            name="remove_current_password"
                            type="password"
                            :label="translations.current_password"
                            :error="errors.current_password"
                        />
                        <button
                            type="submit"
                            class="btn btn-danger btn-sm me-2 passkeys-remove-confirm"
                            :disabled="submitting"
                        >
                            {{ translations.remove }}
                        </button>
                        <button type="button" class="btn btn-link btn-sm passkeys-cancel" @click="reset">
                            {{ translations.cancel }}
                        </button>
                    </form>

                    <div v-else class="d-flex flex-wrap align-items-center gap-2">
                        <div class="me-auto">
                            <div class="fw-semibold passkeys-name">{{ passkey.name }}</div>
                            <small class="text-body-secondary passkeys-dates">
                                {{ translations.added }} {{ passkey.created_at }} · {{ translations.last_used }}
                                {{ passkey.last_used_at || translations.never_used }}
                            </small>
                        </div>
                        <button
                            type="button"
                            class="btn btn-outline-secondary btn-sm passkeys-rename-start"
                            @click="startRename(passkey)"
                        >
                            {{ translations.rename }}
                        </button>
                        <button
                            type="button"
                            class="btn btn-outline-danger btn-sm passkeys-remove-start"
                            @click="startRemove(passkey)"
                        >
                            {{ translations.remove }}
                        </button>
                    </div>
                </li>
            </ul>

            <form v-if="adding" class="passkeys-add" novalidate @submit.prevent="add">
                <FormInput v-model="form.name" name="name" :label="translations.name" :error="errors.name" />
                <FormInput
                    v-model="form.current_password"
                    name="current_password"
                    type="password"
                    :label="translations.current_password"
                    :error="errors.current_password"
                />
                <button type="submit" class="btn btn-primary me-2 passkeys-add-confirm" :disabled="submitting">
                    <i v-if="submitting" class="fa fa-spinner fa-spin"></i>
                    {{ translations.add }}
                </button>
                <button type="button" class="btn btn-link passkeys-cancel" @click="reset">
                    {{ translations.cancel }}
                </button>
            </form>

            <button
                v-else-if="available && supported"
                type="button"
                class="btn btn-primary passkeys-add-start"
                @click="startAdd"
            >
                <i class="fa fa-plus"></i> {{ translations.add }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { validate } from 'vee-validate';
import { FormInput, notifySuccess } from '@dejwcake/craftable';
import { usePasskeys } from '@craftable/composables/usePasskeys.js';

const props = defineProps({
    passkeys: { type: Array, default: () => [] },
    available: { type: Boolean, default: true },
    optionsUrl: { type: String, required: true },
    storeUrl: { type: String, required: true },
    // URL of one passkey with `__id__` in place of its id, for renaming and removing.
    passkeyUrl: { type: String, required: true },
    translations: { type: Object, default: () => ({}) },
});

const axios = window.axios;
const { isSupported, register, isCancelled, defaultName } = usePasskeys();

const supported = isSupported();
const items = ref([...props.passkeys]);
const adding = ref(false);
const renamingId = ref(null);
const removingId = ref(null);
const submitting = ref(false);
const form = ref({ name: '', current_password: '' });
const errors = ref({});
const generalError = ref('');

function reset() {
    adding.value = false;
    renamingId.value = null;
    removingId.value = null;
    form.value = { name: '', current_password: '' };
    errors.value = {};
}

function startAdd() {
    reset();
    generalError.value = '';
    form.value.name = defaultName(props.translations.default_name || undefined);
    adding.value = true;
}

function startRename(passkey) {
    reset();
    generalError.value = '';
    form.value.name = passkey.name;
    renamingId.value = passkey.id;
}

function startRemove(passkey) {
    reset();
    generalError.value = '';
    removingId.value = passkey.id;
}

function urlFor(id) {
    return props.passkeyUrl.replace('__id__', encodeURIComponent(id));
}

function showError(error) {
    if (isCancelled(error)) {
        return;
    }

    const data = error?.response?.data || {};
    if (data.errors) {
        errors.value = Object.fromEntries(Object.entries(data.errors).map(([key, value]) => [key, value[0]]));
        // The ceremony error has no field of its own in the form.
        generalError.value = errors.value.passkey || '';
    } else {
        generalError.value = data.message || props.translations.failed || '';
    }
}

async function run(action) {
    submitting.value = true;
    errors.value = {};
    generalError.value = '';

    try {
        await action();
    } catch (error) {
        showError(error);
    } finally {
        submitting.value = false;
    }
}

const NAME_RULES = 'required|max:255';

function add() {
    return run(async () => {
        const nameCheck = await validate(form.value.name.trim(), NAME_RULES, { name: 'name' });
        if (!nameCheck.valid) {
            errors.value = { name: nameCheck.errors[0] };

            return;
        }

        const credential = await register(props.optionsUrl, { current_password: form.value.current_password });
        const { data } = await axios.post(props.storeUrl, { name: form.value.name, credential });
        items.value.push(data.passkey);
        reset();
        notifySuccess(data.message);
    });
}

function rename() {
    return run(async () => {
        const { data } = await axios.patch(urlFor(renamingId.value), { name: form.value.name });
        items.value = items.value.map((item) => (item.id === data.passkey.id ? data.passkey : item));
        reset();
        notifySuccess(data.message);
    });
}

function remove() {
    return run(async () => {
        const id = removingId.value;
        const { data } = await axios.delete(urlFor(id), {
            data: { current_password: form.value.current_password },
        });
        items.value = items.value.filter((item) => item.id !== id);
        reset();
        notifySuccess(data.message);
    });
}
</script>
