"""Real-Thunderbird check: does a GIF inserted by Thundergif show in the draft?

Starts a throwaway, headless Thunderbird with an empty profile (no access to your own
profile, accounts or mail), installs a check build of the add-on, opens a new HTML draft,
lets the add-on insert a GIF through its real insertion path, and reports whether
Thunderbird actually loaded the image.

Usage: python checks/thunderbird/check.py [path-to-src] [--headed]
Needs Thunderbird installed and `pip install -r checks/thunderbird/requirements.txt`.
Exit code 0 = pass, 1 = fail.
"""
import json, os, shutil, subprocess, sys, tempfile, time, zipfile
from marionette_driver.marionette import Marionette
from marionette_driver.addons import Addons

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = next((a for a in sys.argv[1:] if not a.startswith('--')), os.path.join(HERE, '..', '..', 'src'))
HEADLESS = '--headed' not in sys.argv
THUNDERBIRD = os.environ.get('THUNDERBIRD', '/Applications/Thunderbird.app/Contents/MacOS/thunderbird')
PORT = 2931

PREFS = {
    'marionette.port': PORT,
    'xpinstall.signatures.required': False,
    'mail.provider.suppress_dialog_on_startup': True,
    'mailnews.start_page.enabled': False,
    'mail.shell.checkDefaultClient': False,
    'mail.spotlight.firstRunDone': True,
    'app.update.disabledForTesting': True,
    'datareporting.policy.dataSubmissionEnabled': False,
    'toolkit.telemetry.enabled': False,
    # A dummy account so a compose window can open. Nothing connects to these servers.
    'mail.accountmanager.accounts': 'account1',
    'mail.accountmanager.defaultaccount': 'account1',
    'mail.account.account1.identities': 'id1',
    'mail.account.account1.server': 'server1',
    'mail.server.server1.type': 'pop3',
    'mail.server.server1.hostname': 'localhost.invalid',
    'mail.server.server1.userName': 'check',
    'mail.server.server1.login_at_startup': False,
    'mail.server.server1.check_new_mail': False,
    'mail.identity.id1.useremail': 'check@example.invalid',
    'mail.identity.id1.fullName': 'Check',
    'mail.identity.id1.compose_html': True,
    'mail.identity.id1.smtpServer': 'smtp1',
    'mail.smtpservers': 'smtp1',
    'mail.smtpserver.smtp1.hostname': 'localhost.invalid',
}

OPEN_DRAFT = """
const { MailServices } = ChromeUtils.importESModule("resource:///modules/MailServices.sys.mjs");
const params = Cc["@mozilla.org/messengercompose/composeparams;1"].createInstance(Ci.nsIMsgComposeParams);
params.type = Ci.nsIMsgCompType.New;
params.format = Ci.nsIMsgCompFormat.HTML;
params.identity = MailServices.accounts.defaultAccount.defaultIdentity;
params.composeFields = Cc["@mozilla.org/messengercompose/composefields;1"].createInstance(Ci.nsIMsgCompFields);
MailServices.compose.OpenComposeWindowWithParams(null, params);
"""

DRAFT_IMAGES = """
const win = Services.wm.getMostRecentWindow("msgcompose");
if (!win) return null;
const doc = win.GetCurrentEditorElement().contentDocument;
return Array.from(doc.images).map(i => ({ alt: i.alt, complete: i.complete, naturalWidth: i.naturalWidth,
  mozDoNotSend: i.getAttribute("moz-do-not-send") }));
"""


def build_check_xpi(work):
    addon = os.path.join(work, 'addon')
    shutil.copytree(SRC, addon, ignore=shutil.ignore_patterns('*.d.ts', '.DS_Store'))
    shutil.copy(os.path.join(HERE, 'check-background.js'), addon)
    manifest_path = os.path.join(addon, 'manifest.json')
    manifest = json.load(open(manifest_path))
    manifest['background'] = {'scripts': ['check-background.js'], 'type': 'module'}
    json.dump(manifest, open(manifest_path, 'w'))
    xpi = os.path.join(work, 'check.xpi')
    with zipfile.ZipFile(xpi, 'w') as z:
        for root, _, files in os.walk(addon):
            for f in files:
                path = os.path.join(root, f)
                z.write(path, os.path.relpath(path, addon))
    return xpi, manifest['browser_specific_settings']['gecko']['id']


def main():
    work = tempfile.mkdtemp(prefix='thundergif-check-')
    profile = os.path.join(work, 'profile')
    os.makedirs(profile)
    with open(os.path.join(profile, 'user.js'), 'w') as f:
        for key, value in PREFS.items():
            f.write(f'user_pref({json.dumps(key)}, {json.dumps(value)});\n')
    xpi, _ = build_check_xpi(work)
    args = [THUNDERBIRD, '--profile', profile, '--marionette', '--no-remote', '--remote-allow-system-access']
    if HEADLESS:
        args.append('--headless')
    thunderbird = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        client = Marionette(host='127.0.0.1', port=PORT)
        client.start_session()
        client.set_context(client.CONTEXT_CHROME)
        Addons(client).install(xpi, temp=True)
        time.sleep(1)
        client.execute_script(OPEN_DRAFT)
        images = None
        for _ in range(30):
            time.sleep(0.5)
            images = client.execute_script(DRAFT_IMAGES)
            if images and all(i['complete'] for i in images):
                break
        print('Images in draft:', json.dumps(images))
        ok = bool(images) and all(i['naturalWidth'] > 0 and i['mozDoNotSend'] == 'true' for i in images)
        print('PASS: inserted GIF shows in the draft as a link' if ok else 'FAIL: inserted GIF missing or not shown')
        return 0 if ok else 1
    finally:
        thunderbird.terminate()
        thunderbird.wait(timeout=30)
        shutil.rmtree(work, ignore_errors=True)


sys.exit(main())
