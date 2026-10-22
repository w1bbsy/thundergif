/* global ExtensionCommon, Services */
"use strict";

// Thunderbird blocks remote images in a draft unless the compose window's allowRemoteContent
// flag is on. Its own Insert > Image, paste and drop turn the flag on and leave it on; there is
// no WebExtension API for it, so this Experiment does the same for the add-on's compose tab.
var thundergifCompose = class extends ExtensionCommon.ExtensionAPI {
  onShutdown(isAppShutdown) {
    // When the add-on is disabled, removed or updated (not when Thunderbird quits), clear the
    // startup cache so an updated version of this module is loaded rather than a cached copy.
    if (isAppShutdown) return;
    Services.obs.notifyObservers(null, "startupcache-invalidate", null);
  }

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
