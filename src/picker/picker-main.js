import { startPicker } from './picker.js';

startPicker({ document, browser: globalThis.browser, fetch: globalThis.fetch.bind(globalThis), close: () => window.close() });
