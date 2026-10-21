import { startSettings } from './settings.js';

startSettings({ document, browser: globalThis.browser, fetch: globalThis.fetch.bind(globalThis) });
