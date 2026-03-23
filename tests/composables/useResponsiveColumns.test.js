import { describe, it, expect, afterEach, vi } from 'vitest';
import { ref } from 'vue';
import { withSetup } from '../helpers/withSetup.js';
import { useResponsiveColumns } from '@/composables/useResponsiveColumns.js';

describe('useResponsiveColumns', () => {
    let unmount;
    let capturedCallback;

    // Capture the ResizeObserver callback
    const OriginalResizeObserver = globalThis.ResizeObserver;

    afterEach(() => {
        if (unmount) unmount();
        globalThis.ResizeObserver = OriginalResizeObserver;
        capturedCallback = null;
    });

    function setupWithWidth(initialWidth = 1900, options = {}) {
        // Replace ResizeObserver to capture callback and auto-trigger
        globalThis.ResizeObserver = class {
            constructor(callback) {
                capturedCallback = callback;
            }
            observe() {
                // Trigger immediately with initial width
                if (capturedCallback) {
                    capturedCallback([{ contentRect: { width: initialWidth } }]);
                }
            }
            unobserve() {}
            disconnect() {}
        };

        const containerRef = ref(document.createElement('div'));
        const { result, unmount: u } = withSetup(useResponsiveColumns, [containerRef, options]);
        unmount = u;

        return {
            result,
            triggerResize: (width) => {
                if (capturedCallback) {
                    capturedCallback([{ contentRect: { width } }]);
                }
            },
        };
    }

    it('shows all columns at wide width (1900)', () => {
        const { result } = setupWithWidth(1900);
        expect(result.isColumnVisible(10)).toBe(true);
    });

    it('hides high-priority columns at medium width (900)', () => {
        const { result } = setupWithWidth(900);
        expect(result.isColumnVisible(2)).toBe(true);
        expect(result.isColumnVisible(3)).toBe(false);
    });

    it('hides most columns at narrow width (500)', () => {
        const { result } = setupWithWidth(500);
        expect(result.isColumnVisible(1)).toBe(false);
    });

    it('updates priority when width changes', () => {
        const { result, triggerResize } = setupWithWidth(1900);
        expect(result.isColumnVisible(10)).toBe(true);

        triggerResize(900);
        expect(result.isColumnVisible(10)).toBe(false);
        expect(result.isColumnVisible(2)).toBe(true);
    });

    it('respects custom breakpoints', () => {
        const customBreakpoints = [
            { minWidth: 500, maxPriority: 5 },
            { minWidth: 0, maxPriority: 1 },
        ];
        const { result } = setupWithWidth(600, { breakpoints: customBreakpoints });
        expect(result.isColumnVisible(5)).toBe(true);
        expect(result.isColumnVisible(6)).toBe(false);
    });
});
