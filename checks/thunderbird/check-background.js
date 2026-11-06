// Background script added only to the check build: when a compose tab opens, insert one GIPHY
// and one KLIPY GIF through the add-on's real insertion path, as the Picker would. Both use the
// one media server per Provider that the adapters insert from (media.giphy.com, static.klipy.com).
import { insertIntoCompose } from './compose/insert.js';

const GIFS = [
  {
    id: 'check-giphy',
    description: 'Thundergif check GIF (GIPHY)',
    preview: { url: '', width: 0, height: 0 },
    insert: {
      url: 'https://media.giphy.com/media/v1.Y2lkPWYwODJhZjNmbXlyMXo5NDZ6aDlpdTF0d3FxYWFvMnNrcDRzMDhmbjV0aXJlZHc5aiZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/axu6dFuca4HKM/giphy.gif',
      width: 500,
      height: 238,
    },
  },
  {
    id: 'check-klipy',
    description: 'Thundergif check GIF (KLIPY)',
    preview: { url: '', width: 0, height: 0 },
    insert: {
      url: 'https://static.klipy.com/ii/84b4c0b02782dda9051003f9e36484ec/5d/93/bmwu4BDQ.gif',
      width: 220,
      height: 220,
    },
  },
];

browser.tabs.onCreated.addListener(async (tab) => {
  if (tab.type !== 'messageCompose') return;
  // Give the editor time to finish setting up before inserting.
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const results = [];
  for (const gif of GIFS) results.push(await insertIntoCompose(browser, tab.id, gif).catch((error) => `error: ${error}`));
  await browser.storage.local.set({ checkInsertResult: results });
});

// When the check opens a content tab, open the settings page at the steps for showing GIFs while
// writing, exactly as the Picker's Notice bar link does. Once only: the new window is a tab too.
let settingsOpened = false;
browser.tabs.onCreated.addListener(async (tab) => {
  if (tab.type !== 'content' || settingsOpened) return;
  settingsOpened = true;
  await browser.windows.create({ url: browser.runtime.getURL('settings/settings.html#show-gifs'), type: 'popup', width: 520, height: 640 });
});
