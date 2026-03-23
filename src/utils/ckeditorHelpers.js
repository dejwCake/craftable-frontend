export function propagateImageWidths(html) {
    if (!html) return html;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    let changed = false;
    doc.querySelectorAll('figure').forEach((figure) => {
        const width = figure.style.width;
        if (!width) return;
        const img = figure.querySelector('img');
        if (img) {
            img.style.width = width;
            img.style.height = 'auto';
            changed = true;
        }
    });
    return changed ? doc.body.innerHTML : html;
}

export function deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        if (
            source[key] &&
            typeof source[key] === 'object' &&
            !Array.isArray(source[key]) &&
            target[key] &&
            typeof target[key] === 'object' &&
            !Array.isArray(target[key])
        ) {
            result[key] = deepMerge(target[key], source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}
