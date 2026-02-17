<template>
  <div class="tiptap-editor">
    <div v-if="editor" class="tiptap-toolbar">
      <select @change="setHeading($event)" class="tiptap-heading-select">
        <option value="0" :selected="!editor.isActive('heading')">Paragraph</option>
        <option v-for="level in [1,2,3,4,5,6]" :key="level" :value="level" :selected="editor.isActive('heading', { level })">
          H{{ level }}
        </option>
      </select>

      <button type="button" @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }" title="Bold">
        <strong>B</strong>
      </button>
      <button type="button" @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }" title="Italic">
        <em>I</em>
      </button>
      <button type="button" @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }" title="Strikethrough">
        <s>S</s>
      </button>

      <span class="tiptap-toolbar-divider"></span>

      <button type="button" @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }" title="Bullet List">
        &#8226;
      </button>
      <button type="button" @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }" title="Ordered List">
        1.
      </button>

      <span class="tiptap-toolbar-divider"></span>

      <button type="button" @click="setLink" title="Link">
        &#128279;
      </button>
      <button type="button" @click="addImage" title="Image">
        &#128247;
      </button>

      <span v-if="showTableControls" class="tiptap-toolbar-divider"></span>

      <button v-if="showTableControls" type="button" @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()" title="Insert Table">
        &#9638;
      </button>

      <span class="tiptap-toolbar-divider"></span>

      <button type="button" @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()" title="Undo">
        &#8617;
      </button>
      <button type="button" @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()" title="Redo">
        &#8618;
      </button>
    </div>

    <editor-content :editor="editor" class="tiptap-content" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, watch } from 'vue';
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
  }
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

function addImage() {
  const url = window.prompt('Image URL');
  if (url) {
    editor.value.chain().focus().setImage({ src: url }).run();
  }
}
</script>
