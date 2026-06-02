// ResizeObserver polyfill for jsdom environment
// ngx-echarts requires ResizeObserver which is not available in jsdom
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  (globalThis as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// MutationObserver polyfill for jsdom (used by some nz-* components)
if (typeof (globalThis as any).MutationObserver === 'undefined') {
  (globalThis as any).MutationObserver = class MutationObserver {
    observe() {}
    disconnect() {}
    takeRecords() { return []; }
  };
}
