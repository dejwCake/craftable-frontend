import { describe, it, expect, vi, beforeAll } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineRule } from 'vee-validate';
import { required, email } from '@vee-validate/rules';

vi.mock('vue3-dropzone', () => ({
    useDropzone: vi.fn(() => ({
        getRootProps: () => ({}),
        getInputProps: () => ({}),
        isDragActive: false,
    })),
}));

vi.mock('vue-multiselect', () => ({
    default: {
        name: 'Multiselect',
        template: '<div class="multiselect-stub"><slot /></div>',
        props: ['modelValue', 'options', 'label', 'trackBy', 'placeholder', 'openDirection'],
    },
}));

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

import ProfileForm from '@/account/ProfileForm.vue';

const baseProps = {
    action: '/admin/profile',
    data: { first_name: 'John', last_name: 'Doe', email: 'john@example.com', language: 'en' },
    languageOptions: ['en', 'sk'],
    translations: {
        form_title: 'Edit profile',
        columns: {
            first_name: 'First name',
            last_name: 'Last name',
            email: 'E-mail',
            current_password: 'Current password',
            language: 'Language',
        },
        select_an_option: 'Select an option',
        save: 'Save',
    },
    media: { url: '/admin/upload', collection: 'avatar', maxNumberOfFiles: 1, maxFileSizeInMb: 2, uploadedMedia: [] },
};

describe('ProfileForm', () => {
    beforeAll(() => {
        defineRule('required', required);
        defineRule('email', email);
    });

    it('renders the profile form', () => {
        const wrapper = mount(ProfileForm, { props: baseProps });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('hides the avatar uploader without a media upload url', () => {
        const wrapper = mount(ProfileForm, { props: { ...baseProps, media: undefined } });
        expect(wrapper.find('.avatar-upload').exists()).toBe(false);
        expect(wrapper.find('.col-12').exists()).toBe(true);
    });

    it('fills the fields with the loaded values', () => {
        const wrapper = mount(ProfileForm, { props: baseProps });
        expect(wrapper.find('input#first_name').element.value).toBe('John');
        expect(wrapper.find('input#email').element.value).toBe('john@example.com');
    });

    it('hides the current password while the e-mail is unchanged', () => {
        const wrapper = mount(ProfileForm, { props: baseProps });
        expect(wrapper.find('input#current_password').exists()).toBe(false);
    });

    it('shows the current password once the e-mail changes and hides it when changed back', async () => {
        const wrapper = mount(ProfileForm, { props: baseProps });

        await wrapper.find('input#email').setValue('new@example.com');
        expect(wrapper.find('input#current_password').exists()).toBe(true);

        await wrapper.find('input#email').setValue('john@example.com');
        expect(wrapper.find('input#current_password').exists()).toBe(false);
    });

    it('posts the current password only with a changed e-mail', async () => {
        window.axios.post.mockResolvedValue({ data: {} });
        const wrapper = mount(ProfileForm, { props: baseProps });

        await wrapper.find('input#email').setValue('new@example.com');
        await wrapper.find('input#current_password').setValue('secret');
        await wrapper.find('form').trigger('submit');
        await flushPromises();
        expect(window.axios.post.mock.calls[0][1]).toMatchObject({
            email: 'new@example.com',
            current_password: 'secret',
        });

        await wrapper.find('input#email').setValue('john@example.com');
        await wrapper.find('form').trigger('submit');
        await flushPromises();
        expect(window.axios.post.mock.calls[1][1]).not.toHaveProperty('current_password');
    });
});
