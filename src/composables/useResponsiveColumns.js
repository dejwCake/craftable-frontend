import { ref, watch, onBeforeUnmount } from 'vue';

/**
 * Container width in pixels mapped to the highest column priority still shown at that width.
 *
 * | container width | highest priority shown |
 * |-----------------|------------------------|
 * | 1800 and up     | 10                     |
 * | 1600 - 1799     | 8                      |
 * | 1400 - 1599     | 6                      |
 * | 1200 - 1399     | 4                      |
 * | 1000 - 1199     | 3                      |
 * | 800 - 999       | 2                      |
 * | below 800       | 0                      |
 *
 * The width measured is the container's `contentRect`, so padding is already excluded: a card in a
 * 1512px window measures around 1190px and lands on the `1000 - 1199` row, where only priorities
 * 0 to 3 are shown.
 */
const defaultBreakpoints = [
    { minWidth: 1800, maxPriority: 10 },
    { minWidth: 1600, maxPriority: 8 },
    { minWidth: 1400, maxPriority: 6 },
    { minWidth: 1200, maxPriority: 4 },
    { minWidth: 1000, maxPriority: 3 },
    { minWidth: 800, maxPriority: 2 },
    { minWidth: 0, maxPriority: 0 },
];

/**
 * Hides lower-importance columns as a listing's container narrows.
 *
 * Each column is given a **priority**, not a position: a lower number survives a narrower
 * container, and columns sharing a number appear and disappear together. Numbering columns
 * `0, 1, 2, …` in the order they are written therefore ties importance to layout by accident — the
 * fifth column onwards is hidden on an ordinary laptop, because a priority above 3 needs a
 * container wider than 1200px. Assign the numbers deliberately instead.
 *
 * @param {import('vue').Ref<HTMLElement|null>} containerRef element whose width drives the choice.
 * @param {{ breakpoints?: Array<{ minWidth: number, maxPriority: number }> }} [options]
 *   `breakpoints` replaces the defaults above; order them widest first.
 * @returns {{
 *   isColumnWithinPriority: (priority: number) => boolean,
 *   isColumnVisible: (priority: number) => boolean,
 * }}
 */
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

    /**
     * Whether a column of this priority is shown at the container's current width.
     *
     * @param {number} priority lower survives a narrower container; see the breakpoint table.
     * @returns {boolean}
     */
    function isColumnWithinPriority(priority) {
        return priority <= currentMaxPriority.value;
    }

    return {
        isColumnWithinPriority,
        /**
         * The original name for `isColumnWithinPriority`, and still fully supported -- every
         * existing listing calls it, and the generator emits it. It reads like a column index,
         * which the argument is not.
         */
        isColumnVisible: isColumnWithinPriority,
    };
}
