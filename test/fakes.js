// Fakes for the two things outside the add-on: Thunderbird's add-on API and the network.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

// Plain paths: the simulated browser replaces the URL class, which node:fs rejects.
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', 'src');
const fixtures = join(here, 'fixtures');

/** Load an add-on page's markup into the test document. */
export function loadPage(relativePath) {
  const html = readFileSync(join(root, relativePath), 'utf8');
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  document.head.innerHTML = parsed.head.innerHTML;
  document.body.innerHTML = parsed.body.innerHTML;
}

const declaredOrigins = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8')).host_permissions;

export function fakeThunderbird({ storage = {}, granted = true, editorAccepts = true, plainText = false } = {}) {
  const stored = structuredClone(storage);
  const compose = new JSDOM('<!doctype html><html><body><p>Hello </p></body></html>', {
    runScripts: 'outside-only',
  });
  const composeDoc = compose.window.document;
  // Put the cursor at the end of the existing paragraph.
  const range = composeDoc.createRange();
  range.selectNodeContents(composeDoc.querySelector('p'));
  range.collapse(false);
  compose.window.getSelection().addRange(range);
  // Thunderbird only loads remote images in a draft while the compose window allows remote
  // content (its own Insert > Image and paste turn this on). Images inserted otherwise are blocked.
  const draft = { allowRemoteContent: false, blocked: new WeakSet() };
  const isShownInDraft = (img) => !draft.blocked.has(img);

  // The simulated browser has no editing commands, so stand in for the compose editor's insertImage.
  composeDoc.execCommand = (command, _showUi, value) => {
    if (!editorAccepts) return false;
    const selection = compose.window.getSelection();
    const at = selection.getRangeAt(0);
    if (command === 'insertText') {
      const text = composeDoc.createTextNode(value);
      at.insertNode(text);
      at.setStartAfter(text);
      at.collapse(true);
      return true;
    }
    // The add-on never inserts images into plain-text emails, so the fake refuses them there.
    if (command !== 'insertImage' || plainText) return false;
    const img = composeDoc.createElement('img');
    img.setAttribute('src', value);
    if (!draft.allowRemoteContent) draft.blocked.add(img);
    at.insertNode(img);
    at.setStartAfter(img);
    at.collapse(true);
    return true;
  };

  const browser = {
    storage: {
      local: {
        async get(keys) {
          const list = keys == null ? Object.keys(stored) : [].concat(keys);
          return Object.fromEntries(list.filter((k) => k in stored).map((k) => [k, stored[k]]));
        },
        async set(items) {
          Object.assign(stored, structuredClone(items));
        },
      },
    },
    permissions: {
      // Like Thunderbird, only grant origins the manifest declares.
      contains: async ({ origins }) => granted && origins.every((o) => declaredOrigins.includes(o)),
      request: async ({ origins }) => (granted = origins.every((o) => declaredOrigins.includes(o))),
    },
    tabs: {
      query: async () => [{ id: 7, type: 'messageCompose' }],
    },
    compose: {
      async getComposeDetails(tabId) {
        if (tabId !== 7) throw new Error('Unknown tab');
        return { isPlainText: plainText };
      },
    },
    scripting: {
      injections: [],
      async executeScript(injection) {
        this.injections.push(injection);
        // Run the injected function against the fake compose editor, as Thunderbird would.
        const fn = compose.window.eval(`(${injection.func.toString()})`);
        return [{ result: fn(...(injection.args ?? [])) }];
      },
    },
    runtime: {
      openOptionsPage: async () => {},
    },
    windows: {
      opened: [],
      async openDefaultBrowser(url) {
        this.opened.push(url);
      },
    },
    // Thundergif's own Experiment API.
    thundergifCompose: {
      async allowRemoteImages(tabId) {
        if (tabId === 7) draft.allowRemoteContent = true;
      },
    },
  };

  return { browser, stored, composeDoc, isShownInDraft };
}

/** A fetch stand-in that answers from fixture files and records every request. */
export function fakeNetwork(routes) {
  const requests = [];
  async function fetch(input) {
    const url = new URL(String(input));
    requests.push(url);
    const match = routes.find(
      (r) =>
        url.href.startsWith(r.prefix) &&
        Object.entries(r.params ?? {}).every(([name, value]) => url.searchParams.get(name) === value),
    );
    if (!match) throw new TypeError(`Unexpected request: ${url.origin}${url.pathname}`);
    if (match.delayMs) await new Promise((resolve) => setTimeout(resolve, match.delayMs));
    const body = match.fixture
      ? readFileSync(join(fixtures, match.fixture), 'utf8')
      : JSON.stringify(match.json ?? {});
    return new Response(body, { status: match.status ?? 200, headers: { 'content-type': 'application/json' } });
  }
  return { fetch, requests };
}
