/* global ExtensionCommon */
"use strict";

// Thunderbird blocks remote images in a draft unless the compose window's allowRemoteContent
// flag is on. Its own Insert > Image, paste and drop turn the flag on and leave it on; there is
// no WebExtension API for it, so this Experiment does the same for the add-on's compose tab.
var thundergifCompose = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      thundergifCompose: {
        async allowRemoteImages(tabId) {
          const tab = context.extension.tabManager.get(tabId);
          const composeWindow = tab?.nativeTab;
          if (!composeWindow?.gMsgCompose) {
            throw new context.cloneScope.Error("Not a compose tab");
          }
          composeWindow.gMsgCompose.allowRemoteContent = true;
        },
      },
    };
  }
};
