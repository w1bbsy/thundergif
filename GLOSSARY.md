# Thundergif

A Thunderbird add-on that lets someone writing an email search for a GIF from a GIF service and drop it into the message.

## Language

**Provider**:
A GIF service the add-on can search, such as KLIPY or GIPHY.
_Avoid_: Source, service, platform

**Provider key**:
The developer key a user obtains from a Provider and enters into the add-on to allow searching. It is not a personal account login.
_Avoid_: Login, account, API token, credentials

**Picker**:
The search panel opened from the compose window, where a user finds a GIF and chooses one to insert.
_Avoid_: Popup, search window, browser

**Favourite**:
A GIF a user has starred in the Picker so it can be found again, kept per Provider inside the add-on rather than in any Provider account.
_Avoid_: Saved GIF, bookmark, like

**Rating**:
The content rating ceiling (G, PG, PG-13, or R) that limits which GIFs a search returns.
_Avoid_: Filter, safe search, age rating
