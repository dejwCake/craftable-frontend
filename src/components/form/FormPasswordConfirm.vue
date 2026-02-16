<template>
    <div class="form-group row align-items-center">
        <label for="password" class="col-form-label text-md-end"
               :class="isFormLocalized ? 'col-md-4' : 'col-md-3'">{{ translations.password }}</label>
        <div :class="isFormLocalized ? 'col-md-4' : 'col-md-9 col-xl-7'">
            <input type="password" :value="password" @input="$emit('update:password', $event.target.value)"
                   class="form-control" :class="{'is-invalid': passwordError}"
                   id="password" name="password" :placeholder="translations.password">
            <div v-if="passwordError" class="invalid-feedback form-text">{{ passwordError }}</div>
        </div>
    </div>

    <div class="form-group row align-items-center">
        <label for="password_confirmation" class="col-form-label text-md-end"
               :class="isFormLocalized ? 'col-md-4' : 'col-md-3'">{{ translations.password_repeat }}</label>
        <div :class="isFormLocalized ? 'col-md-4' : 'col-md-9 col-xl-7'">
            <input type="password" :value="passwordConfirmation" @input="$emit('update:passwordConfirmation', $event.target.value)"
                   class="form-control" :class="{'is-invalid': confirmationError}"
                   id="password_confirmation" name="password_confirmation" :placeholder="translations.password">
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
    isFormLocalized: { type: Boolean, default: false },
});

defineEmits(['update:password', 'update:passwordConfirmation']);
</script>
