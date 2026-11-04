# Message to the Thunderbird add-on reviewers

For the maintainer to send from their own email to Tb-addon-reviewers@lists.thunderbird.net, or to post in the Matrix room #tb-addon-reviewers:mozilla.org. Nothing has been sent.

---

**Subject:** ThunderGIF review: is the pause on new Experiment add-ons still in place?

Hello,

Thank you for reviewing ThunderGIF 1.1.1. The rejection cited the pause on new add-ons using Experiment APIs. The announcement on the add-ons list (17 March, "Temporary Pause on New Experiment API Add-on Reviews") says new submissions would not be reviewed "until after the release of Thunderbird ESR 153". As ESR 153 has now been released, could you tell me whether new Experiment add-ons are being accepted again, or whether the stricter rule in the review (only unmodified published API drafts) is now the lasting policy?

For context, ThunderGIF's Experiment is a single function of about 25 lines. It sets `gMsgCompose.allowRemoteContent = true` for the add-on's own compose tab before inserting a remote GIF, which is what Insert > Image and paste already do. Without it, `nsMsgContentPolicy` blocks the GIF in the draft (it is still sent correctly as a link). No WebExtension API can do this today.

If Experiments for new add-ons stay closed, I would be glad to propose a small API draft to thunderbird/webext-experiments instead (for example a way for an add-on to insert a remote image into its compose tab, treated like Insert > Image). Would that route be welcome?

In the meantime I plan to submit a version without the Experiment, so the add-on can be listed.

Thank you,
Wibbsy
