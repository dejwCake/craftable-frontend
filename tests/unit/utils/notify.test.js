import { describe, it, expect, vi } from 'vitest';

vi.mock('@kyvg/vue3-notification', () => ({
    notify: vi.fn(),
}));

import { notify } from '@kyvg/vue3-notification';
import { notifySuccess, notifyError } from '@/utils/notify.js';

describe('notifySuccess', () => {
    it('calls notify with custom message', () => {
        notifySuccess('Item saved');
        expect(notify).toHaveBeenCalledWith({
            type: 'success',
            title: 'Success!',
            text: 'Item saved',
        });
    });

    it('uses default message when none provided', () => {
        notifySuccess();
        expect(notify).toHaveBeenCalledWith({
            type: 'success',
            title: 'Success!',
            text: 'Operation succeeded.',
        });
    });
});

describe('notifyError', () => {
    it('calls notify with custom message', () => {
        notifyError('Something failed');
        expect(notify).toHaveBeenCalledWith({
            type: 'error',
            title: 'Error!',
            text: 'Something failed',
        });
    });

    it('uses default message when none provided', () => {
        notifyError();
        expect(notify).toHaveBeenCalledWith({
            type: 'error',
            title: 'Error!',
            text: 'An error has occurred.',
        });
    });
});
