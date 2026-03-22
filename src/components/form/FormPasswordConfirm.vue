<template>
    <div class="mb-3 row align-items-center">
        <label for="password" class="col-md-3 col-form-label text-md-end">{{ translations.password }}</label>
        <div class="col-md-9 col-xl-8">
            <input
                id="password"
                type="password"
                :value="password"
                class="form-control"
                :class="{ 'is-invalid': passwordError }"
                name="password"
                :placeholder="translations.password"
                @input="$emit('update:password', $event.target.value)"
            />
            <div v-if="passwordError" class="invalid-feedback form-text">{{ passwordError }}</div>
        </div>
    </div>

    <div class="mb-3 row align-items-center">
        <label for="password_confirmation" class="col-md-3 col-form-label text-md-end">{{
            translations.password_repeat
        }}</label>
        <div class="col-md-9 col-xl-8">
            <input
                id="password_confirmation"
                type="password"
                :value="passwordConfirmation"
                class="form-control"
                :class="{ 'is-invalid': confirmationError }"
                name="password_confirmation"
                :placeholder="translations.password"
                @input="$emit('update:passwordConfirmation', $event.target.value)"
            />
            <div v-if="confirmationError" class="invalid-feedback form-text">{{ confirmationError }}</div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    password: { type: String, default: '' },
    passwordConfirmation: { type: String, default: '' },
    passwordError: { type: String, default: '' },
    confirmationError: { type: String, default: '' },
    translations: { type: Object, required: true },
});

defineEmits(['update:password', 'update:passwordConfirmation']);
</script>
