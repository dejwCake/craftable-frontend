<template>
    <div class="tiptap-editor">
        <div v-if="editor" class="tiptap-toolbar">
            <select class="tiptap-heading-select" @change="setHeading($event)">
                <option value="0" :selected="!editor.isActive('heading')">Paragraph</option>
                <option
                    v-for="level in [1, 2, 3, 4, 5, 6]"
                    :key="level"
                    :value="level"
                    :selected="editor.isActive('heading', { level })"
                >
                    H{{ level }}
                </option>
            </select>

            <button
                type="button"
                :class="{ 'is-active': editor.isActive('bold') }"
                title="Bold"
                @click="editor.chain().focus().toggleBold().run()"
            >
                <strong>B</strong>
            </button>
            <button
                type="button"
                :class="{ 'is-active': editor.isActive('italic') }"
                title="Italic"
                @click="editor.chain().focus().toggleItalic().run()"
            >
                <em>I</em>
            </button>
            <button
                type="button"
                :class="{ 'is-active': editor.isActive('strike') }"
                title="Strikethrough"
                @click="editor.chain().focus().toggleStrike().run()"
            >
                <s>S</s>
            </button>

            <span class="tiptap-toolbar-divider"></span>

            <button
                type="button"
                :class="{ 'is-active': editor.isActive('bulletList') }"
                title="Bullet List"
                @click="editor.chain().focus().toggleBulletList().run()"
            >
                &#8226;
            </button>
            <button
                type="button"
                :class="{ 'is-active': editor.isActive('orderedList') }"
                title="Ordered List"
                @click="editor.chain().focus().toggleOrderedList().run()"
            >
                1.
            </button>

            <span class="tiptap-toolbar-divider"></span>

            <button type="button" title="Link" @click="setLink">&#128279;</button>
            <button type="button" title="Upload Image" @click="uploadImage">&#128228;</button>
            <button type="button" title="Image URL" @click="addImageByUrl">&#128247;</button>
            <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="onFileSelected" />

            <span v-if="showTableControls" class="tiptap-toolbar-divider"></span>

            <button
                v-if="showTableControls"
                type="button"
                title="Insert Table"
                @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()"
            >
                &#9638;
            </button>

            <span class="tiptap-toolbar-divider"></span>

            <button
                type="button"
                :disabled="!editor.can().undo()"
                title="Undo"
                @click="editor.chain().focus().undo().run()"
            >
                &#8617;
            </button>
            <button
                type="button"
                :disabled="!editor.can().redo()"
                title="Redo"
                @click="editor.chain().focus().redo().run()"
            >
                &#8618;
            </button>
        </div>

        <editor-content :editor="editor" class="tiptap-content" />
    </div>
</template>

<script setup>
import { ref, onBeforeUnmount, watch } from 'vue';
const axios = window.axios;
import { notifyError } from '../../utils/notify.js';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    config: {
        type: Object,
        default: () => ({}),
    },
    showTableControls: {
        type: Boolean,
        default: true,
    },
    uploadUrl: {
        type: String,
        default: '/admin/wysiwyg-media',
    },
});

const emit = defineEmits(['update:modelValue', 'media-uploaded']);

const extensions = [
    StarterKit,
    Image.configure({
        HTMLAttributes: {
            class: 'tiptap-image',
        },
    }),
    Link.configure({
        openOnClick: false,
    }),
    Table.configure({
        resizable: true,
    }),
    TableRow,
    TableCell,
    TableHeader,
    ...(props.config.extensions || []),
];

const editor = useEditor({
    content: props.modelValue,
    extensions,
    onUpdate: ({ editor: ed }) => {
        emit('update:modelValue', ed.getHTML());
    },
});

watch(
    () => props.modelValue,
    (value) => {
        if (editor.value && editor.value.getHTML() !== value) {
            editor.value.commands.setContent(value, false);
        }
    },
);

onBeforeUnmount(() => {
    if (editor.value) {
        editor.value.destroy();
    }
});

function setHeading(event) {
    const level = parseInt(event.target.value);
    if (level === 0) {
        editor.value.chain().focus().setParagraph().run();
    } else {
        editor.value.chain().focus().toggleHeading({ level }).run();
    }
}

function setLink() {
    const previousUrl = editor.value.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;

    if (url === '') {
        editor.value.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
    }

    editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
}

const fileInput = ref(null);

function addImageByUrl() {
    const url = window.prompt('Image URL');
    if (url) {
        editor.value.chain().focus().setImage({ src: url }).run();
    }
}

function uploadImage() {
    fileInput.value.click();
}

function onFileSelected(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('fileToUpload', file);

    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    axios
        .post(props.uploadUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...(token ? { 'X-CSRF-TOKEN': token } : {}),
            },
        })
        .then(
            (response) => {
                editor.value.chain().focus().setImage({ src: response.data.file }).run();
                emit('media-uploaded', response.data);
            },
            (error) => {
                notifyError(error.response?.data?.error);
            },
        )
        .finally(() => {
            fileInput.value.value = '';
        });
}
</script>
