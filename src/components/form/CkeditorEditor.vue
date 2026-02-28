<template>
    <div class="ck-editor-wrapper">
        <ckeditor :editor="ClassicEditor" v-model="content" :config="editorConfig" />
    </div>
</template>

<script setup>
import { ref, computed, toRaw } from 'vue';
import { ClassicEditor, Essentials, Bold, Italic, Underline, Strikethrough,
    Heading, Paragraph, Alignment, List, Link, AutoLink,
    Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageInsert, ImageInsertViaUrl, ImageUpload,
    Table, TableToolbar, CodeBlock, Code, SourceEditing, BlockQuote,
    HorizontalLine, Indent, GeneralHtmlSupport, Undo, FileRepository } from 'ckeditor5';
import { Ckeditor } from '@ckeditor/ckeditor5-vue';
import axios from 'axios';

import 'ckeditor5/ckeditor5.css';

const props = defineProps({
    modelValue: { type: String, default: '' },
    config: { type: Object, default: null },
    uploadUrl: { type: String, default: '/admin/wysiwyg-media' },
});

const emit = defineEmits(['update:modelValue', 'media-uploaded']);

const content = computed({
    get: () => props.modelValue ?? '',
    set: (val) => emit('update:modelValue', propagateImageWidths(val)),
});

function propagateImageWidths(html) {
    if (!html) return html;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    let changed = false;
    doc.querySelectorAll('figure').forEach(figure => {
        const width = figure.style.width;
        if (!width) return;
        const img = figure.querySelector('img');
        if (img) {
            img.style.width = width;
            img.style.height = 'auto';
            changed = true;
        }
    });
    return changed ? doc.body.innerHTML : html;
}

function createUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new CsrfUploadAdapter(loader, props.uploadUrl);
    };
}

class CsrfUploadAdapter {
    constructor(loader, url) {
        this.loader = loader;
        this.url = url;
    }

    upload() {
        return this.loader.file.then(file => {
            const formData = new FormData();
            formData.append('fileToUpload', file);

            return axios.post(this.url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (evt) => {
                    if (evt.total) {
                        this.loader.uploadTotal = evt.total;
                        this.loader.uploaded = evt.loaded;
                    }
                },
            }).then(response => {
                const url = response.data.file || response.data.url || response.data;
                emit('media-uploaded', response.data);
                return { default: url };
            });
        });
    }

    abort() {}
}

const defaultConfig = {
    licenseKey: 'GPL',
    plugins: [
        Essentials, Bold, Italic, Underline, Strikethrough,
        Heading, Paragraph, Alignment, List, Link, AutoLink,
        Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageInsert, ImageInsertViaUrl, ImageUpload,
        Table, TableToolbar, CodeBlock, Code, SourceEditing, BlockQuote,
        HorizontalLine, Indent, GeneralHtmlSupport, Undo, FileRepository,
    ],
    extraPlugins: [createUploadAdapterPlugin],
    toolbar: {
        items: [
            'heading', '|',
            'bold', 'italic', 'underline', 'strikethrough', '|',
            'alignment', '|',
            'bulletedList', 'numberedList', '|',
            'blockQuote', 'horizontalLine', '|',
            'link', 'insertImage', 'insertTable', '|',
            'code', 'codeBlock', '|',
            'undo', 'redo', '|',
            'sourceEditing',
        ],
        shouldNotGroupWhenFull: true,
    },
    image: {
        toolbar: [
            'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|',
            'toggleImageCaption', 'imageTextAlternative', '|',
            'resizeImage',
        ],
        resizeUnit: 'px',
        resizeOptions: [
            { name: 'resizeImage:original', value: null, label: 'Original' },
            { name: 'resizeImage:200', value: '200', label: '200px' },
            { name: 'resizeImage:400', value: '400', label: '400px' },
            { name: 'resizeImage:600', value: '600', label: '600px' },
        ],
    },
    table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
    },
    htmlSupport: {
        allow: [{ name: /.*/, attributes: true, classes: true, styles: true }],
    },
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
        ],
    },
};

const editorConfig = computed(() => {
    if (!props.config) return defaultConfig;
    return deepMerge(defaultConfig, toRaw(props.config));
});

function deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])
            && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
            result[key] = deepMerge(target[key], source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

</script>
