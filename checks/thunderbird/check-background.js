// Background script added only to the check build: when a compose tab opens, insert a GIF
// through the add-on's real insertion path, as the Picker would.
import { insertIntoCompose } from './compose/insert.js';

const GIF = {
  id: 'check',
  description: 'Thundergif check GIF',
  preview: { url: '', width: 0, height: 0 },
  insert: {
    url: 'https://media1.giphy.com/media/v1.Y2lkPWYwODJhZjNmbXlyMXo5NDZ6aDlpdTF0d3FxYWFvMnNrcDRzMDhmbjV0aXJlZHc5aiZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/axu6dFuca4HKM/giphy.gif',
    width: 500,
    height: 238,
  },
};

browser.tabs.onCreated.addListener(async (tab) => {
  if (tab.type !== 'messageCompose') return;
  // Give the editor time to finish setting up before inserting.
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const accepted = await insertIntoCompose(browser, tab.id, GIF).catch((error) => `error: ${error}`);
  await browser.storage.local.set({ checkInsertResult: accepted });
});
