import { notify } from '@kyvg/vue3-notification';

const DEFAULT_SUCCESS_TITLE = 'Success!';
const DEFAULT_SUCCESS_MESSAGE = 'Operation succeeded.';
const DEFAULT_ERROR_TITLE = 'Error!';
const DEFAULT_ERROR_MESSAGE = 'An error has occurred.';

export function notifySuccess(message) {
    notify({
        type: 'success',
        title: DEFAULT_SUCCESS_TITLE,
        text: message || DEFAULT_SUCCESS_MESSAGE,
    });
}

export function notifyError(message) {
    notify({
        type: 'error',
        title: DEFAULT_ERROR_TITLE,
        text: message || DEFAULT_ERROR_MESSAGE,
    });
}
