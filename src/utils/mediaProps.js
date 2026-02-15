export const mediaCollectionDefaults = {
    url: '',
    collection: '',
    maxNumberOfFiles: 1,
    maxFileSizeInMb: 2,
    acceptedFileTypes: undefined,
    thumbnailWidth: 200,
    uploadedMedia: []
};

export const mediaCollectionProp = {
    type: Object,
    default: () => ({ ...mediaCollectionDefaults }),
};
