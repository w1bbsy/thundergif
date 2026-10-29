"""Real-Thunderbird check: does a GIF inserted by Thundergif show in an HTML draft, and is
its link pasted into a plain-text draft?

Starts a throwaway, headless Thunderbird with an empty profile (no access to your own
profile, accounts or mail), installs a check build of the add-on, opens a new HTML draft,
lets the add-on insert a GIF through its real insertion path, and reports whether
Thunderbird actually loaded the image.

It also compares the installed Thunderbird with the add-on's cap (strict_max_version, which
addons.thunderbird.net requires because Thundergif contains an Experiment). If the cap is below
the installed version, Thunderbird would switch the add-on off, so the check says so, fails,
and tests the add-on with the cap raised to show whether raising it is safe.

Usage: python checks/thunderbird/check.py [path-to-src] [--headed]
Needs Thunderbird installed and `pip install -r checks/thunderbird/requirements.txt`.
Exit code 0 = everything passes on the installed Thunderbird, 1 = anything else.
"""
import json, os, re, shutil, subprocess, sys, tempfile, time, zipfile
from marionette_driver.marionette import Marionette
from marionette_driver.addons import Addons

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = next((a for a in sys.argv[1:] if not a.startswith('--')), os.path.join(HERE, '..', '..', 'src'))
HEADLESS = '--headed' not in sys.argv
THUNDERBIRD = os.environ.get('THUNDERBIRD', '/Applications/Thunderbird.app/Contents/MacOS/thunderbird')
PORT = 2931
# The GIF the check build inserts, read from check-background.js so the two cannot drift.
GIF_URL = re.search(r"url: '([^']+)'", open(os.path.join(HERE, 'check-background.js')).read()).group(1)

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
params.format = arguments[0] ? Ci.nsIMsgCompFormat.PlainText : Ci.nsIMsgCompFormat.HTML;
params.identity = MailServices.accounts.defaultAccount.defaultIdentity;
params.composeFields = Cc["@mozilla.org/messengercompose/composefields;1"].createInstance(Ci.nsIMsgCompFields);
MailServices.compose.OpenComposeWindowWithParams(null, params);
"""

CLOSE_DRAFT = """
const win = Services.wm.getMostRecentWindow("msgcompose");
win.gMsgCompose.bodyModified = false;
win.close();
"""

DRAFT_TEXT = """
const win = Services.wm.getMostRecentWindow("msgcompose");
return win ? win.GetCurrentEditorElement().contentDocument.body.textContent : null;
"""

DRAFT_IMAGES = """
const win = Services.wm.getMostRecentWindow("msgcompose");
if (!win) return null;
const doc = win.GetCurrentEditorElement().contentDocument;
return Array.from(doc.images).map(i => ({ alt: i.alt, complete: i.complete, naturalWidth: i.naturalWidth,
  mozDoNotSend: i.getAttribute("moz-do-not-send") }));
"""


def build_check_xpi(work, cap=None):
    addon = os.path.join(work, 'addon')
    shutil.copytree(SRC, addon, ignore=shutil.ignore_patterns('*.d.ts', '.DS_Store'))
    shutil.copy(os.path.join(HERE, 'check-background.js'), addon)
    manifest_path = os.path.join(addon, 'manifest.json')
    manifest = json.load(open(manifest_path))
    manifest['background'] = {'scripts': ['check-background.js'], 'type': 'module'}
    if cap:
        manifest['browser_specific_settings']['gecko']['strict_max_version'] = cap
    json.dump(manifest, open(manifest_path, 'w'))
    xpi = os.path.join(work, 'check.xpi')
    with zipfile.ZipFile(xpi, 'w') as z:
        for root, _, files in os.walk(addon):
            for f in files:
                path = os.path.join(root, f)
                z.write(path, os.path.relpath(path, addon))
    return xpi, manifest['browser_specific_settings']['gecko']['id']


def installed_major():
    """The major version of the installed Thunderbird, e.g. 159."""
    out = subprocess.run([THUNDERBIRD, '--version'], capture_output=True, text=True).stdout
    return int(re.search(r'(\d+)\.', out).group(1)), out.strip()


def manifest_cap():
    """The add-on's cap, e.g. '158.*', and its major version."""
    manifest = json.load(open(os.path.join(SRC, 'manifest.json')))
    cap = manifest['browser_specific_settings']['gecko'].get('strict_max_version', '*')
    return cap, (None if cap == '*' else int(cap.split('.')[0]))


def run_drafts(cap=None):
    """Installs a check build in a throwaway Thunderbird and tests both draft types.
    Returns True when the GIF shows in an HTML draft and its link lands in a plain-text one."""
    work = tempfile.mkdtemp(prefix='thundergif-check-')
    profile = os.path.join(work, 'profile')
    os.makedirs(profile)
    with open(os.path.join(profile, 'user.js'), 'w') as f:
        for key, value in PREFS.items():
            f.write(f'user_pref({json.dumps(key)}, {json.dumps(value)});\n')
    xpi, _ = build_check_xpi(work, cap)
    args = [THUNDERBIRD, '--profile', profile, '--marionette', '--no-remote', '--remote-allow-system-access']
    if HEADLESS:
        args.append('--headless')
    # Thunderbird 159 and later also need this before Marionette may act with system access.
    env = {**os.environ, 'MOZ_REMOTE_ALLOW_SYSTEM_ACCESS': '1'}
    thunderbird = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=env)
    try:
        client = Marionette(host='127.0.0.1', port=PORT)
        client.start_session()
        client.set_context(client.CONTEXT_CHROME)
        try:
            Addons(client).install(xpi, temp=True)
        except Exception as error:
            print(f'FAIL: Thunderbird refused to install the add-on ({type(error).__name__})')
            return False
        time.sleep(1)
        client.execute_script(OPEN_DRAFT, script_args=[False])
        images = None
        for _ in range(30):
            time.sleep(0.5)
            images = client.execute_script(DRAFT_IMAGES)
            if images and all(i['complete'] for i in images):
                break
        print('HTML draft images:', json.dumps(images))
        html_ok = bool(images) and all(i['naturalWidth'] > 0 and i['mozDoNotSend'] == 'true' for i in images)
        print('PASS: GIF shows in the HTML draft as a link' if html_ok else 'FAIL: GIF missing or not shown in the HTML draft')

        client.execute_script(CLOSE_DRAFT)
        time.sleep(1)
        client.execute_script(OPEN_DRAFT, script_args=[True])
        text = ''
        for _ in range(30):
            time.sleep(0.5)
            text = client.execute_script(DRAFT_TEXT) or ''
            if 'giphy.com' in text:
                break
        plain_ok = GIF_URL in text and client.execute_script(DRAFT_IMAGES) == []
        print('PASS: GIF link typed into the plain-text draft' if plain_ok else f'FAIL: plain-text draft holds {text!r}')
        return html_ok and plain_ok
    finally:
        thunderbird.terminate()
        thunderbird.wait(timeout=30)
        shutil.rmtree(work, ignore_errors=True)


def main():
    major, version_text = installed_major()
    cap, cap_major = manifest_cap()
    print(f'Installed: {version_text}. Thundergif cap: {cap}.')
    if cap_major is None or cap_major >= major:
        ok = run_drafts()
        print('RESULT: all good on this Thunderbird.' if ok else 'RESULT: Thundergif fails on this Thunderbird. A real fix is needed, not just a cap change.')
        return 0 if ok else 1
    print(f'Thundergif\'s cap is {cap}, below Thunderbird {major}: Thunderbird would switch it off.')
    print(f'Testing with the cap raised to {major}.* ...')
    ok = run_drafts(cap=f'{major}.*')
    if ok:
        print(f'RESULT: raise the cap to {major}.* (it works). Run: npm run compat -- {major}')
    else:
        print('RESULT: Thundergif fails on this Thunderbird even with the cap raised. A real fix is needed.')
    return 1


sys.exit(main())
