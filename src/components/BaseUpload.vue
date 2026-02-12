<template>
  <div class="base-upload">
    <vue3-dropzone
      :id="collection"
      :ref="setDropzoneRef"
      :url="url"
      :max-files="maxNumberOfFiles"
      :max-file-size="maxFileSizeInMb"
      :accepted-files="acceptedFileTypes"
      :thumbnail-width="thumbnailWidth"
      :headers="headers"
      @success="onSuccess"
      @error="onUploadError"
      @file-added="onFileAdded"
      @file-removed="onFileDelete"
    >
      <input type="hidden" name="collection" :value="collection" />
    </vue3-dropzone>

    <div v-if="mutableUploadedMedia.length > 0" class="uploaded-media-list">
      <div
        v-for="(file, index) in mutableUploadedMedia"
        :key="file.id || index"
        class="dz-preview dz-file-preview"
        :class="{ 'dz-deleted': file.deleted }"
      >
        <div class="dz-image">
          <img v-if="isImage(file)" :src="file.thumb_url" :alt="file.name" />
          <div v-else class="dz-file-icon">
            <i :class="getIconClass(file)"></i>
            <p>{{ file.name }}</p>
          </div>
        </div>
        <div class="dz-details">
          <div class="dz-filename">
            <a v-if="file.url" :href="file.url" target="_blank" class="dz-btn dz-custom-download">
              {{ file.name }}
            </a>
            <span v-else>{{ file.name }}</span>
          </div>
        </div>
        <button type="button" class="dz-remove-btn" @click="removeUploadedFile(index)">
          &times;
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { notify } from '@kyvg/vue3-notification';

export default defineComponent({
  name: 'BaseUpload',
  props: {
    url: {
      type: String,
      required: true,
    },
    collection: {
      type: String,
      required: true,
    },
    maxNumberOfFiles: {
      type: Number,
      default: 1,
    },
    maxFileSizeInMb: {
      type: Number,
      default: 2,
    },
    acceptedFileTypes: {
      type: String,
      default: undefined,
    },
    thumbnailWidth: {
      type: Number,
      default: 200,
    },
    uploadedImages: {
      type: Array,
      default: () => [],
    },
    uploadedMedia: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const dropzoneRef = ref(null);
    const uploadedFiles = ref([]);
    const mutableUploadedMedia = ref([]);

    const headers = ref({});
    const csrfToken = document.head.querySelector('meta[name="csrf-token"]');
    if (csrfToken) {
      headers.value = {
        'X-CSRF-TOKEN': csrfToken.getAttribute('content'),
      };
    }

    function setDropzoneRef(el) {
      dropzoneRef.value = el;
    }

    function getFileObj(file) {
      return {
        id: file.id,
        collection_name: props.collection,
        name: file.custom_properties?.name ?? file.file_name ?? file.name,
        type: file.mime_type ?? file.type,
        size: file.size,
        url: file.original_url ?? file.url,
        thumb_url: file.thumb_url ?? file.original_url ?? file.url,
      };
    }

    function getMutableUploadedMedia() {
      const files = [];
      const source = props.uploadedMedia.length === 0 ? props.uploadedImages : props.uploadedMedia;
      source.forEach((file) => {
        files.push(getFileObj(file));
      });
      return files;
    }

    onMounted(() => {
      mutableUploadedMedia.value = getMutableUploadedMedia();
    });

    function onSuccess(file, response) {
      uploadedFiles.value.push({ file, response });
    }

    function onUploadError(file, error) {
      const errorMessage = typeof error === 'string' ? error : error.message;
      notify({ type: 'error', title: 'Error!', text: errorMessage });
    }

    function onFileAdded(file) {
      // File added to dropzone
    }

    function onFileDelete(file) {
      const index = uploadedFiles.value.findIndex((f) => f.file === file);
      if (index !== -1) {
        uploadedFiles.value.splice(index, 1);
      }
    }

    function removeUploadedFile(index) {
      if (mutableUploadedMedia.value[index]) {
        mutableUploadedMedia.value[index].deleted = true;
      }
    }

    function isImage(file) {
      return file.type && file.type.includes('image');
    }

    function getIconClass(file) {
      const type = file.type || '';
      if (type.includes('pdf')) return 'fa-solid fa-file-pdf';
      if (type.includes('word')) return 'fa-solid fa-file-word';
      if (type.includes('spreadsheet') || type.includes('csv')) return 'fa-solid fa-file-excel';
      if (type.includes('presentation')) return 'fa-solid fa-file-powerpoint';
      if (type.includes('video')) return 'fa-solid fa-file-video';
      if (type.includes('text')) return 'fa-solid fa-file-lines';
      if (type.includes('zip') || type.includes('rar')) return 'fa-solid fa-file-zipper';
      return 'fa-solid fa-file';
    }

    function getFiles() {
      const files = [];

      mutableUploadedMedia.value.forEach((file) => {
        if (file.deleted) {
          files.push({
            id: file.id,
            collection_name: props.collection,
            action: 'delete',
          });
        }
      });

      uploadedFiles.value.forEach(({ file, response }) => {
        const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
        if (parsedResponse.path) {
          files.push({
            id: file.id,
            collection_name: props.collection,
            path: parsedResponse.path,
            action: 'add',
            meta_data: {
              name: file.name,
              file_name: file.name,
              width: file.width,
              height: file.height,
            },
          });
        }
      });

      return files;
    }

    return {
      dropzoneRef,
      mutableUploadedMedia,
      headers,
      setDropzoneRef,
      onSuccess,
      onUploadError,
      onFileAdded,
      onFileDelete,
      removeUploadedFile,
      isImage,
      getIconClass,
      getFiles,
    };
  },
});
</script>
