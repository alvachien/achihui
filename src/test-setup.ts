// ResizeObserver polyfill for jsdom environment
// ngx-echarts requires ResizeObserver which is not available in jsdom
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  (globalThis as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock canvas getContext for jsdom — ECharts requires a canvas context to initialize
// This avoids the "Not implemented: HTMLCanvasElement.prototype.getContext" error
// and the need to install the `canvas` npm package
if (typeof HTMLCanvasElement !== 'undefined' && !(HTMLCanvasElement.prototype as any).__mockGetContext) {
  const mockContextCache = new WeakMap<HTMLCanvasElement, any>();

  function getMockContext(canvas: HTMLCanvasElement): any {
    if (!mockContextCache.has(canvas)) {
      const ctx: any = {
        dpr: 1,
        __fillStyle: '',
        __strokeStyle: '',
        get fillStyle() { return this.__fillStyle; },
        set fillStyle(v: string) { this.__fillStyle = v; },
        get strokeStyle() { return this.__strokeStyle; },
        set strokeStyle(v: string) { this.__strokeStyle = v; },
        lineWidth: 1,
        font: '12px sans-serif',
        textAlign: 'start',
        textBaseline: 'alphabetic',
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        lineCap: 'butt',
        lineJoin: 'miter',
        miterLimit: 10,
        shadowBlur: 0,
        shadowColor: 'rgba(0,0,0,0)',
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        clearRect() {},
        fillRect() {},
        strokeRect() {},
        save() {},
        restore() {},
        fillText() {},
        strokeText() {},
        measureText() { return { width: 0, actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0, actualBoundingBoxLeft: 0, actualBoundingBoxRight: 0 }; },
        beginPath() {},
        closePath() {},
        moveTo() {},
        lineTo() {},
        quadraticCurveTo() {},
        bezierCurveTo() {},
        arcTo() {},
        arc() {},
        rect() {},
        ellipse() {},
        stroke() {},
        fill() {},
        clip() {},
        rotate() {},
        scale() {},
        translate() {},
        transform() {},
        setTransform() {},
        setLineDash() {},
        getLineDash() { return []; },
        createLinearGradient() { return { addColorStop() {} }; },
        createRadialGradient() { return { addColorStop() {} }; },
        createPattern() { return null; },
        getImageData() { return { data: new Uint8ClampedArray(4), width: 1, height: 1 }; },
        putImageData() {},
        drawImage() {},
        isPointInPath() { return false; },
        isPointInStroke() { return false; },
        createImageData() { return { data: new Uint8ClampedArray(4), width: 1, height: 1 }; },
        drawFocusIfNeeded() {},
        scrollPathIntoView() {},
        getTransform() { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }; },
        resetTransform() {},
      };
      mockContextCache.set(canvas, ctx);
    }
    return mockContextCache.get(canvas);
  }

  (HTMLCanvasElement.prototype as any).__mockGetContext = true;
  (HTMLCanvasElement.prototype as any).getContext = function(contextId: string, ..._args: unknown[]) {
    if (contextId === '2d') {
      return getMockContext(this);
    }
    if (contextId === 'webgl' || contextId === 'webgl2') {
      return null;
    }
    return null;
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



