# 04: KLIPY Provider

**What to build:** A user enters a KLIPY Provider key on the settings page and, with KLIPY as the only key, gets the same Picker experience as GIPHY: trending on open, search, More, and insertion of the medium (md) version as a link. The search box placeholder reads "Search KLIPY". KLIPY results appear in the order KLIPY returns them. The Rating is translated to KLIPY's content filter (R to off, PG-13 to low, PG to medium, G to high). Until ticket 05 lands, if both keys are present GIPHY stays active.

**Blocked by:** 02 (Search with More), 03 (Rating setting)

**Status:** ready-for-agent

- [ ] Settings page has a KLIPY Provider key field, stored locally
- [ ] With only a KLIPY key, the Picker shows KLIPY trending, search, and More, 24 per page
- [ ] Clicking a KLIPY GIF inserts the md version as a link, same as GIPHY
- [ ] Search placeholder reads "Search KLIPY"; no GIPHY attribution shown while KLIPY is active
- [ ] KLIPY results are never reordered or filtered by the add-on
- [ ] Each Rating maps to the agreed KLIPY content filter value on trending and search
- [ ] Host permissions extended to KLIPY API and media hosts only
- [ ] Automated tests through the one seam use trimmed recorded KLIPY responses
- [ ] Manual check, recorded in the ticket: real KLIPY results look sensible at each Rating; note KLIPY's default content filter if observable
