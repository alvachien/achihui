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

// DOM dimension stubs for ECharts in jsdom
// ECharts needs non-zero clientWidth/clientHeight to initialize charts
// We use Object.defineProperty to override the getter on Element prototype
Object.defineProperty(Element.prototype, 'clientWidth', {
  configurable: true,
  get(this: Element): number {
    // Check if this is likely a chart container
    const classes = this.className || '';
    if (typeof classes === 'string' && (classes.includes('echarts') || classes.includes('chart'))) {
      return 800;
    }
    // Check by tag name and style
    if ((this as HTMLElement).style?.width) {
      const w = (this as HTMLElement).style.width;
      const num = parseInt(w, 10);
      if (num > 0) return num;
    }
    // Return a default non-zero value for all divs
    if (this.tagName === 'DIV') return 800;
    return 0;
  },
});

Object.defineProperty(Element.prototype, 'clientHeight', {
  configurable: true,
  get(this: Element): number {
    const classes = this.className || '';
    if (typeof classes === 'string' && (classes.includes('echarts') || classes.includes('chart'))) {
      return 600;
    }
    if ((this as HTMLElement).style?.height) {
      const h = (this as HTMLElement).style.height;
      const num = parseInt(h, 10);
      if (num > 0) return num;
    }
    if (this.tagName === 'DIV') return 600;
    return 0;
  },
});

Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  get(this: HTMLElement): number {
    if (this.tagName === 'DIV') return 800;
    return 0;
  },
});

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  get(this: HTMLElement): number {
    if (this.tagName === 'DIV') return 600;
    return 0;
  },
});



