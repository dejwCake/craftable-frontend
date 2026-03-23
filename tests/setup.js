import { vi, beforeEach } from 'vitest';

// Mock window.axios — must be set before any module that captures it at module scope
const axiosMock = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
    },
};

globalThis.window = globalThis.window ?? {};
globalThis.window.axios = axiosMock;

// Mock ResizeObserver (not available in happy-dom)
globalThis.ResizeObserver = class ResizeObserver {
    constructor(callback) {
        this._callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Reset mock call counts between tests without replacing references
beforeEach(() => {
    vi.clearAllMocks();
});
