import dropzone from 'vue2-dropzone';

const BaseUpload = {
  components: {
    Dropzone: dropzone,
  },
  props: {
    url: {
      type: String,
      required: true
    },
    collection: {
      type: String,
      required: true
    },
    maxNumberOfFiles: {
      type: Number,
      required: false,
      default: 1
    },
    maxFileSizeInMb: {
      type: Number,
      required: false,
      default: 2
    },
    acceptedFileTypes: {
      type: String,
      required: false
    },
    thumbnailWidth: {
      type: Number,
      required: false,
      default: 200
    },
    uploadedImages: {
      type: Array,
      required: false,
      default: function _default() {
        return [];
      }
    },
    uploadedMedia: {
      type: Array,
      required: false,
      default: function _default() {
        return [];
      }
    }
  },
  data: function data() {
    return {
      mutableUploadedMedia: this.getMutableUploadedMedia(),
      headers: {
        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').getAttribute('content')
      }
    };
  },
  template: `<dropzone :id="collection" 
                       :url="url" 
                       v-bind:preview-template="template"
                       v-on:vdropzone-success="onSuccess"
                       v-on:vdropzone-error="onUploadError"
                       v-on:vdropzone-removed-file="onFileDelete"
                       v-on:vdropzone-file-added="onFileAdded"
                       :useFontAwesome="true" 
                       :ref="collection"
                       :maxNumberOfFiles="maxNumberOfFiles"
                       :maxFileSizeInMB="maxFileSizeInMb"
                       :acceptedFileTypes="acceptedFileTypes"
                       :thumbnailWidth="thumbnailWidth"
                       :headers="headers">
                
                <input type="hidden" name="collection" :value="collection">
            </dropzone>`,
  mounted: function () {     
    this.attachAlreadyUploadedMedia();
  },
  methods: {
    getMutableUploadedMedia: function () {
      var files = [];

      if (this.uploadedMedia.length === 0) {
        _.each(this.uploadedImages, (file, key) => {
          files.push(this.getFileObj(file));
        });
      } else {
        _.each(this.uploadedMedia, (file, key) => {
          files.push(this.getFileObj(file));
        });
      }

      return files;
    },

    attachAlreadyUploadedMedia: function attachAlreadyUploadedMedia() {
      this.$nextTick(() => {
        if (this.mutableUploadedMedia) {
          _.each(this.mutableUploadedMedia, (file, key) => {
            this.$refs[this.collection].manuallyAddFile(
                {
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  url: file.url,
                },
                file.thumb_url,
                false,
                false,
                {
                  dontSubstractMaxFiles: false,
                  addToFiles: true
                }
            );
          });
        }
      });
    },

    onSuccess: function onSuccess(file, response) {
      if (!file.type.includes('image')) {
        setTimeout(function () {
          file.previewElement.classList.remove('dz-file-preview');
        }, 3000);
      }
    },

    onUploadError: function onUploadError(file, error) {
      let errorMessage = typeof error == 'string' ? error : error.message;
      this.$notify({ type: 'error', title: 'Error!', text: errorMessage });
      file.previewElement.querySelector('.dz-error-message span').textContent = errorMessage;
    },

    onFileAdded: function onFileAdded(file) {
      this.placeIcon(file);
    },

    onFileDelete: function (file, error, xhr) {
      let deletedFileIndex = _.findIndex(this.mutableUploadedMedia, (e) => e.url === file.url);
      if (!deletedFileIndex || !file.url) {
        deletedFileIndex = _.findIndex(this.mutableUploadedMedia, (e) => e.name === file.name);
      }
      if(this.mutableUploadedMedia[deletedFileIndex]) {
        this.mutableUploadedMedia[deletedFileIndex]['deleted'] = true;

        //dontSubstractMaxFiles fix
        let currentMax = this.$refs[this.collection].dropzone.options.maxFiles;
        this.$refs[this.collection].setOption('maxFiles', currentMax + 1);
      }
    },

    getFiles: function getFiles() {
      let files = [];

      _.each(this.mutableUploadedMedia, (file, key) => {
        if (file.deleted) {
          files.push({
            id: file.id,
            collection_name: this.collection,
            action: 'delete'
          });
        }
      });

      _.each(this.$refs[this.collection].getAcceptedFiles(),(file, key) => {
        let response = JSON.parse(file.xhr.response);

        if (response.path) {
          files.push({
            id: file.id,
            collection_name: this.collection,
            path: response.path,
            action: file.deleted ? 'delete' : 'add', //TODO: update ie. meta_data.name
            meta_data: {
              name: file.name, //TODO: editable in the future
              file_name: file.name,
              width: file.width,
              height: file.height
            }
          });
        }
      });

      return files;
    },

    placeIcon: function (file) {
      let previewElement = file.previewElement;

      if (file.url) {
        previewElement.querySelector('.dz-filename').innerHTML = '<a href="' + file.url + '" target="_BLANK" class="dz-btn dz-custom-download">' + file.name + '</a>';
      }

      if (file.type) {
        if (file.type.includes('image')) {
          //nothing, default thumb
        } else if (file.type.includes('pdf')) {
          previewElement.querySelector('.dz-image').innerHTML = '<i class="fa fa-file-pdf-o"></i><p>' + file.name + '</p>';
        } else if (file.type.includes('word')) {
          previewElement.querySelector('.dz-image').innerHTML = '<i class="fa fa-file-word-o"></i><p>' + file.name + '</p>';
        } else if (file.type.includes('spreadsheet') || file.type.includes('csv')) {
          previewElement.querySelector('.dz-image').innerHTML = '<i class="fa fa-file-excel-o"></i><p>' + file.name + '</p>';
        } else if (file.type.includes('presentation')) {
          previewElement.querySelector('.dz-image').innerHTML = '<i class="fa fa-file-powerpoint-o"></i><p>' + file.name + '</p>';
        } else if (file.type.includes('video')) {
          previewElement.querySelector('.dz-image').innerHTML = '<i class="fa fa-file-video-o"></i><p>' + file.name + '</p>';
        } else if (file.type.includes('text')) {
          previewElement.querySelector('.dz-image').innerHTML = '<i class="fa fa-file-text-o"></i><p>' + file.name + '</p>';
        } else if (file.type.includes('zip') || file.type.includes('rar')) {
          previewElement.querySelector('.dz-image').innerHTML = '<i class="fa fa-file-archive-o"></i><p>' + file.name + '</p>';
        } else {
          previewElement.querySelector('.dz-image').innerHTML = '<i class="fa fa-file-o"></i><p>' + file.name + '</p>';
        }
      } else {
        previewElement.querySelector('.dz-image').innerHTML = '<i class="fa fa-file-o"></i><p>' + file.name + '</p>';
      }
    },

    template: function() {
      return `
              <div class="dz-preview dz-file-preview">
                  <div class="dz-image">
                      <img data-dz-thumbnail />
                  </div>
                  <div class="dz-details">
                    <div class="dz-size"><span data-dz-size></span></div>
                    <div class="dz-filename"></div>
                  </div>
                  <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
                  <div class="dz-error-message"><span data-dz-errormessage></span></div>
                  <div class="dz-success-mark"><i class="fa fa-check"></i></div>
                  <div class="dz-error-mark"><i class="fa fa-close"></i></div>
              </div>
          `;
    },

    getFileObj: function (file) {
      return {
        id: file.id,
        collection_name: this.collection,
        name: file.custom_properties?.name ?? file.file_name ?? file.name,
        type: file.mime_type ?? file.type,
        size: file.size,
        url: file.original_url ?? file.url,
        thumb_url: file.thumb_url ?? file.original_url ?? file.url,
      };
    }
  }
}

export default BaseUpload;
