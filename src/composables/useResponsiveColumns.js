import { ref, watch, onBeforeUnmount } from 'vue';

const defaultBreakpoints = [
    { minWidth: 1800, maxPriority: 10 },
    { minWidth: 1600, maxPriority: 8 },
    { minWidth: 1400, maxPriority: 6 },
    { minWidth: 1200, maxPriority: 4 },
    { minWidth: 1000, maxPriority: 3 },
    { minWidth: 800, maxPriority: 2 },
    { minWidth: 0, maxPriority: 0 },
];

export function useResponsiveColumns(containerRef, options = {}) {
    const breakpoints = options.breakpoints || defaultBreakpoints;
    const currentMaxPriority = ref(10);
    let observer = null;

    function updatePriority(width) {
        for (const bp of breakpoints) {
            if (width >= bp.minWidth) {
                currentMaxPriority.value = bp.maxPriority;
                return;
            }
        }
        currentMaxPriority.value = 0;
    }

    function setupObserver(el) {
        if (observer) {
            observer.disconnect();
        }
        if (!el) return;

        observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                updatePriority(entry.contentRect.width);
            }
        });
        observer.observe(el);
    }

    watch(
        containerRef,
        (el) => {
            setupObserver(el);
        },
        { immediate: true },
    );

    onBeforeUnmount(() => {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    });

    function isColumnVisible(priority) {
        return priority <= currentMaxPriority.value;
    }

    return { isColumnVisible };
}
