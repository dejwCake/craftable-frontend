import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ConfirmModal from '@/components/ConfirmModal.vue';

let wrapper;

afterEach(() => {
    if (wrapper) wrapper.unmount();
    // Clean up teleported content
    document.body.innerHTML = '';
});

function mountModal(props = {}) {
    wrapper = mount(ConfirmModal, {
        props: {
            show: true,
            ...props,
        },
        attachTo: document.body,
    });
    return wrapper;
}

// Helper to find elements in teleported content
function findInBody(selector) {
    return document.body.querySelector(selector);
}

function findAllInBody(selector) {
    return [...document.body.querySelectorAll(selector)];
}

describe('ConfirmModal', () => {
    describe('btnClass', () => {
        it('danger variant has no text-white', () => {
            mountModal({ variant: 'danger' });
            const buttons = findAllInBody('.modal-footer button');
            const confirmBtn = buttons.find((b) => b.textContent.includes('Yes, confirm'));
            expect(confirmBtn.classList.contains('btn-danger')).toBe(true);
            expect(confirmBtn.classList.contains('text-white')).toBe(false);
        });

        it('success variant has text-white', () => {
            mountModal({ variant: 'success' });
            const buttons = findAllInBody('.modal-footer button');
            const confirmBtn = buttons.find((b) => b.textContent.includes('Yes, confirm'));
            expect(confirmBtn.classList.contains('btn-success')).toBe(true);
            expect(confirmBtn.classList.contains('text-white')).toBe(true);
        });

        it('primary variant has text-white', () => {
            mountModal({ variant: 'primary' });
            const buttons = findAllInBody('.modal-footer button');
            const confirmBtn = buttons.find((b) => b.textContent.includes('Yes, confirm'));
            expect(confirmBtn.classList.contains('btn-primary')).toBe(true);
            expect(confirmBtn.classList.contains('text-white')).toBe(true);
        });
    });

    describe('iconClass', () => {
        it('danger variant shows exclamation icon', () => {
            mountModal({ variant: 'danger' });
            const icon = findInBody('.modal-title i');
            expect(icon.classList.contains('fa-triangle-exclamation')).toBe(true);
            expect(icon.classList.contains('text-danger')).toBe(true);
        });

        it('success variant shows check icon', () => {
            mountModal({ variant: 'success' });
            const icon = findInBody('.modal-title i');
            expect(icon.classList.contains('fa-circle-check')).toBe(true);
            expect(icon.classList.contains('text-success')).toBe(true);
        });
    });

    describe('events', () => {
        it('emits confirm when confirm button is clicked', async () => {
            const w = mountModal();
            const buttons = findAllInBody('.modal-footer button');
            const confirmBtn = buttons.find((b) => b.textContent.includes('Yes, confirm'));
            confirmBtn.click();
            await w.vm.$nextTick();
            expect(w.emitted('confirm')).toHaveLength(1);
        });

        it('emits cancel when cancel button is clicked', async () => {
            const w = mountModal();
            const buttons = findAllInBody('.modal-footer button');
            const cancelBtn = buttons.find((b) => b.textContent.includes('Cancel'));
            cancelBtn.click();
            await w.vm.$nextTick();
            expect(w.emitted('cancel')).toHaveLength(1);
        });
    });
});
