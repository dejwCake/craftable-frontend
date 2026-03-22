<template>
    <div class="base-upload">
        <label v-if="label" class="form-label d-flex align-items-center">
            <i :class="labelIcon" class="me-1 text-body-secondary"></i>
            <span class="fw-semibold upload-label-title">{{ label }}</span>
            <small v-for="(c, i) in constraintParts" :key="i" class="text-body-secondary fw-light ms-1"
                >({{ c }})</small
            >
            <i v-if="isPrivate" class="fa fa-lock ms-auto text-body-secondary"></i>
        </label>
        <div v-bind="getRootProps()" class="vue3-dropzone dropzone" :class="{ 'dz-drag-hover': isDragActive }">
            <input v-bind="getInputProps()" />
            <input type="hidden" name="collection" :value="collection" />

            <div v-if="visibleUploadedMedia.length === 0 && uploadedFiles.length === 0" class="dz-message">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <p>Drop files here or click to upload</p>
            </div>

            <div
                v-for="(file, index) in mutableUploadedMedia"
                :key="'existing-' + (file.id || index)"
                class="dz-preview dz-file-preview dz-existing"
                :class="{ 'dz-deleted': file.deleted }"
            >
                <div class="dz-image">
                    <img v-if="isImage(file)" :src="file.thumb_url" :alt="file.name" />
                    <div v-else class="dz-file-icon">
                        <i :class="getIconClass(file)"></i>
                        <p>{{ file.name }}</p>
                    </div>
                </div>
                <div class="dz-hover-overlay" @click.stop>
                    <span class="dz-file-size">{{ formatSize(file.size) }}</span>
                    <span class="dz-file-name">{{ file.name }}</span>
                    <button type="button" class="dz-remove-btn" @click.stop="removeUploadedFile(index)">REMOVE</button>
                </div>
            </div>

            <div
                v-for="(entry, index) in uploadedFiles"
                :key="'new-' + index"
                class="dz-preview dz-file-preview"
                :class="{ 'dz-success': entry.showSuccess, 'dz-error': entry.showError }"
            >
                <div class="dz-image">
                    <img v-if="entry.previewUrl" :src="entry.previewUrl" :alt="entry.file.name" />
                    <div v-else class="dz-file-icon">
                        <i :class="getIconClassFromType(entry.file.type)"></i>
                        <p>{{ entry.file.name }}</p>
                    </div>
                </div>
                <div v-if="entry.uploading" class="dz-progress">
                    <span class="dz-upload" :style="{ width: entry.progress + '%' }"></span>
                </div>
                <div v-if="entry.showSuccess" class="dz-success-mark">
                    <i class="fa-solid fa-check"></i>
                </div>
                <div v-if="entry.showError" class="dz-error-mark">
                    <i class="fa-solid fa-xmark"></i>
                </div>
                <div v-if="!entry.uploading && !entry.showSuccess" class="dz-hover-overlay" @click.stop>
                    <span class="dz-file-size">{{ formatSize(entry.file.size) }}</span>
                    <span class="dz-file-name">{{ entry.file.name }}</span>
                    <button type="button" class="dz-remove-btn" @click.stop="removeNewFile(index)">REMOVE</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useDropzone } from 'vue3-dropzone';
import { notifyError } from '../../utils/notify.js';
const axios = window.axios;

const props = defineProps({
    url: {
        type: String,
        required: true,
    },
    collection: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        default: '',
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
    isPrivate: {
        type: Boolean,
        default: false,
    },
    thumbnailWidth: {
        type: Number,
        default: 200,
    },
    uploadedMedia: {
        type: Array,
        default: () => [],
    },
});

const labelIcon = computed(() => {
    if (!props.acceptedFileTypes) return 'fa fa-file';
    return props.acceptedFileTypes.includes('image') ? 'fa fa-file-image' : 'fa fa-file';
});

const constraintParts = computed(() => {
    const parts = [];
    if (props.maxNumberOfFiles > 0) {
        parts.push(`max. ${props.maxNumberOfFiles} file${props.maxNumberOfFiles > 1 ? 's' : ''}`);
    }
    if (props.maxFileSizeInMb > 0) {
        parts.push(`max. ${props.maxFileSizeInMb.toFixed(2)} MB`);
    }
    return parts;
});

const uploadedFiles = ref([]);
const mutableUploadedMedia = ref([]);

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
    props.uploadedMedia.forEach((file) => {
        files.push(getFileObj(file));
    });
    return files;
}

const visibleUploadedMedia = computed(() => mutableUploadedMedia.value.filter((f) => !f.deleted));

onMounted(() => {
    mutableUploadedMedia.value = getMutableUploadedMedia();
});

function uploadFile(file) {
    const entry = reactive({
        file,
        response: null,
        previewUrl: file.type && file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        uploading: true,
        progress: 0,
        showSuccess: false,
        showError: false,
    });

    uploadedFiles.value.push(entry);

    const formData = new FormData();
    formData.append('file', file);

    const csrfToken = document.head.querySelector('meta[name="csrf-token"]');

    axios
        .post(props.url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken.getAttribute('content') } : {}),
            },
            onUploadProgress(progressEvent) {
                if (progressEvent.total) {
                    entry.progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                }
            },
        })
        .then((response) => {
            entry.response = response.data;
            entry.uploading = false;
            entry.showSuccess = true;
            setTimeout(() => {
                entry.showSuccess = false;
            }, 1500);
        })
        .catch((error) => {
            const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
            notifyError(errorMessage);
            entry.uploading = false;
            entry.showError = true;
            setTimeout(() => {
                const idx = uploadedFiles.value.indexOf(entry);
                if (idx !== -1) {
                    uploadedFiles.value.splice(idx, 1);
                }
            }, 2000);
        });
}

function onDrop(acceptedFiles, fileRejections) {
    fileRejections.forEach((rejection) => {
        const messages = rejection.errors.map((e) => e?.message || 'Invalid file').join(', ');
        notifyError(`${rejection.file.name}: ${messages}`);
    });

    if (props.maxNumberOfFiles > 0) {
        const currentCount = visibleUploadedMedia.value.length + uploadedFiles.value.length;
        const available = props.maxNumberOfFiles - currentCount;
        if (available <= 0) {
            notifyError(`Maximum ${props.maxNumberOfFiles} file${props.maxNumberOfFiles > 1 ? 's' : ''} allowed`);
            return;
        }
        if (acceptedFiles.length > available) {
            notifyError(`Only ${available} more file${available > 1 ? 's' : ''} can be added`);
            acceptedFiles = acceptedFiles.slice(0, available);
        }
    }

    acceptedFiles.forEach((file) => {
        uploadFile(file);
    });
}

const dropzoneOptions = {
    onDrop,
    accept: props.acceptedFileTypes ? props.acceptedFileTypes.split(',').map((t) => t.trim()) : undefined,
    maxSize: props.maxFileSizeInMb > 0 ? props.maxFileSizeInMb * 1024 * 1024 : Infinity,
    multiple: props.maxNumberOfFiles !== 1,
};

const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

function removeUploadedFile(index) {
    if (mutableUploadedMedia.value[index]) {
        mutableUploadedMedia.value[index].deleted = true;
    }
}

function removeNewFile(index) {
    uploadedFiles.value.splice(index, 1);
}

function formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function isImage(file) {
    return file.type && file.type.includes('image');
}

function getIconClass(file) {
    return getIconClassFromType(file.type || '');
}

function getIconClassFromType(type) {
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

    uploadedFiles.value.forEach((entry) => {
        if (entry.response?.path) {
            files.push({
                id: entry.file.id,
                collection_name: props.collection,
                path: entry.response.path,
                action: 'add',
                meta_data: {
                    name: entry.file.name,
                    file_name: entry.file.name,
                    width: entry.file.width,
                    height: entry.file.height,
                },
            });
        }
    });

    return files;
}

defineExpose({ getFiles });
</script>
