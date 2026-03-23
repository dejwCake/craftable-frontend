import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('vue3-dropzone', () => ({
    useDropzone: vi.fn(() => ({
        getRootProps: () => ({}),
        getInputProps: () => ({}),
        isDragActive: false,
    })),
}));

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

import MediaUpload from '@/components/form/MediaUpload.vue';

const baseProps = {
    url: '/admin/upload',
    collection: 'images',
};

describe('MediaUpload', () => {
    it('renders empty state with drop message', () => {
        const wrapper = mount(MediaUpload, { props: baseProps });
        expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders constraint parts for max files and size', () => {
        const wrapper = mount(MediaUpload, {
            props: { ...baseProps, label: 'Photos', maxNumberOfFiles: 3, maxFileSizeInMb: 5 },
        });
        expect(wrapper.text()).toContain('max. 3 files');
        expect(wrapper.text()).toContain('max. 5.00 MB');
    });

    it('renders image icon for image types', () => {
        const wrapper = mount(MediaUpload, {
            props: { ...baseProps, label: 'Images', acceptedFileTypes: 'image/jpeg,image/png' },
        });
        expect(wrapper.find('i.fa-file-image').exists()).toBe(true);
    });

    it('renders file icon for non-image types', () => {
        const wrapper = mount(MediaUpload, {
            props: { ...baseProps, label: 'Documents' },
        });
        expect(wrapper.find('i.fa-file').exists()).toBe(true);
    });

    it('renders lock icon for private uploads', () => {
        const wrapper = mount(MediaUpload, {
            props: { ...baseProps, label: 'Private files', isPrivate: true },
        });
        expect(wrapper.find('i.fa-lock').exists()).toBe(true);
    });

    it('shows dropzone area', () => {
        const wrapper = mount(MediaUpload, { props: baseProps });
        expect(wrapper.find('.vue3-dropzone').exists()).toBe(true);
    });

    it('renders existing uploaded media on mount', async () => {
        const wrapper = mount(MediaUpload, {
            props: {
                ...baseProps,
                uploadedMedia: [
                    {
                        id: 1,
                        file_name: 'photo.jpg',
                        mime_type: 'image/jpeg',
                        size: 1024,
                        original_url: '/media/photo.jpg',
                        thumb_url: '/media/photo-thumb.jpg',
                    },
                ],
            },
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.dz-existing').length).toBe(1);
    });

    it('exposes getFiles method', () => {
        const wrapper = mount(MediaUpload, { props: baseProps });
        expect(typeof wrapper.vm.getFiles).toBe('function');
        expect(wrapper.vm.getFiles()).toEqual([]);
    });
});
