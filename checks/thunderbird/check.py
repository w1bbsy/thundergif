"""Real-Thunderbird check of both Editions (ADR 0002): does a GIF inserted by Thundergif go into
an HTML draft as a link, and is its link pasted into a plain-text draft? For the ATN edition, do
its settings steps open from the Notice bar link and copy the right address?

For each Edition it starts a throwaway, headless Thunderbird with an empty profile (no access
to your own profile, accounts or mail), installs a check build, opens a new HTML draft, lets
the add-on insert a GIF through its real insertion path, and reports whether Thunderbird
loaded the image. Thundergif Live's GIF must show in the draft (its Experiment unblocks it);
the ATN edition's GIF must be inserted but blocked, as it has no Experiment. The ATN edition's
settings page must also open at the steps, and its Copy button must put the GIPHY address on the
clipboard without any clipboard permission.

It also compares the installed Thunderbird with Thundergif Live's cap (strict_max_version,
which addons.thunderbird.net requires of add-ons with an Experiment; the ATN edition has none).
If the cap is below the installed version, Thunderbird would switch Live off, so the check
says so, fails, and tests Live with the cap raised to show whether raising it is safe.

Usage: python checks/thunderbird/check.py [--headed]
Needs Thunderbird installed and `pip install -r checks/thunderbird/requirements.txt`.
Exit code 0 = everything passes on the installed Thunderbird, 1 = anything else.
"""
import hashlib, json, os, re, shutil, ssl, subprocess, sys, tempfile, time, urllib.request, zipfile
import certifi
from marionette_driver.by import By
from marionette_driver.marionette import ActionSequence, Marionette
from marionette_driver.addons import Addons

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..', '..')
HEADLESS = '--headed' not in sys.argv
THUNDERBIRD = os.environ.get('THUNDERBIRD', '/Applications/Thunderbird.app/Contents/MacOS/thunderbird')
PORT = 2931
# The GIF the check build inserts, read from check-background.js so the two cannot drift.
GIF_URLS = re.findall(r"url: '(https[^']+)'", open(os.path.join(HERE, 'check-background.js')).read())
# The one media server per Provider that the adapters insert from, so one remote-content
# exception per Provider is enough for the ATN edition (the settings page will list these).
EXCEPTIONS = ['https://media.giphy.com', 'https://static.klipy.com']
# The same GIFs on servers the Providers also use, which the adapters rewrite to the ones above.
# Each must serve the same file as its main-server address in GIF_URLS.
OTHER_SERVERS = [
    GIF_URLS[0].replace('://media.giphy.com/', '://media1.giphy.com/'),
    GIF_URLS[0].replace('://media.giphy.com/', '://i.giphy.com/'),
    GIF_URLS[1].replace('://static.klipy.com/', '://static2.klipy.com/'),
]

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

ADD_EXCEPTIONS = """
for (const origin of arguments[0]) {
  const principal = Services.scriptSecurityManager.createContentPrincipalFromOrigin(origin);
  Services.perms.addFromPrincipal(principal, "image", Services.perms.ALLOW_ACTION);
}
"""

DRAFT_IMAGES = """
const win = Services.wm.getMostRecentWindow("msgcompose");
if (!win) return null;
const doc = win.GetCurrentEditorElement().contentDocument;
return Array.from(doc.images).map(i => ({ alt: i.alt, complete: i.complete, naturalWidth: i.naturalWidth,
  mozDoNotSend: i.getAttribute("moz-do-not-send") }));
"""


def build_check_xpi(work, edition, cap=None):
    addon = os.path.join(work, 'addon')
    os.makedirs(addon)
    # The same staging the release build uses, so the check tests what ships.
    subprocess.run(['node', os.path.join(ROOT, 'scripts', 'editions.mjs'), edition, addon], check=True)
    shutil.copy(os.path.join(HERE, 'check-background.js'), addon)
    with open(os.path.join(addon, 'settings', 'settings-main.js'), 'a') as page:
        page.write(open(os.path.join(HERE, 'check-settings.js')).read())
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


# certifi's certificate bundle: Python on macOS does not use the system's by default.
TLS = ssl.create_default_context(cafile=certifi.where())


def fingerprint(url):
    # A generic client name: KLIPY refuses Python's default one.
    request = urllib.request.Request(url, headers={'User-Agent': 'thundergif-check'})
    with urllib.request.urlopen(request, timeout=30, context=TLS) as response:
        return hashlib.sha256(response.read()).hexdigest()


def same_files_on_main_servers():
    """True when each GIF on another server is byte-identical to its main-server address."""
    ok = True
    for other in OTHER_SERVERS:
        main = next(u for u in GIF_URLS if u.split('/', 3)[3] == other.split('/', 3)[3])
        other_host, main_host = other.split('/')[2], main.split('/')[2]
        try:
            same = fingerprint(other) == fingerprint(main)
            print(f'PASS: {other_host} serves the same GIF as {main_host}' if same
                  else f'FAIL: {other_host} and {main_host} serve different files')
        except OSError as error:
            same = False
            print(f'FAIL: could not compare {other_host} with {main_host} ({error})')
        ok = ok and same
    return ok


def installed_major():
    """The major version of the installed Thunderbird, e.g. 159."""
    out = subprocess.run([THUNDERBIRD, '--version'], capture_output=True, text=True).stdout
    return int(re.search(r'(\d+)\.', out).group(1)), out.strip()


def manifest_cap():
    """Thundergif Live's cap, e.g. '158.*', and its major version."""
    live = json.load(open(os.path.join(ROOT, 'editions', 'live.json')))
    cap = live['browser_specific_settings']['gecko'].get('strict_max_version', '*')
    return cap, (None if cap == '*' else int(cap.split('.')[0]))


def html_draft_images(client, expect_shown=False):
    """Opens a new HTML draft (the check build inserts its GIFs) and returns its images once loaded.
    A blocked or failed image also counts as loaded, so when the GIFs should show, keep waiting a
    while for them in case a download is slow."""
    client.execute_script(OPEN_DRAFT, script_args=[False])
    images = []
    for _ in range(30 if not expect_shown else 60):
        time.sleep(0.5)
        images = client.execute_script(DRAFT_IMAGES) or []
        settled = len(images) == len(GIF_URLS) and all(i['complete'] for i in images)
        if settled and (not expect_shown or all(i['naturalWidth'] > 0 for i in images)):
            break
    print('HTML draft images:', json.dumps(images))
    return images


OPEN_CONTENT_TAB = """
Services.wm.getMostRecentWindow("mail:3pane").document.getElementById("tabmail")
  .openTab("contentTab", { url: "about:blank" });
"""

SETTINGS_STATE = """
const win = Services.wm.getMostRecentWindow("mail:extensionPopup");
const title = win?.document.querySelector("browser")?.browsingContext?.currentWindowGlobal?.documentTitle;
return title?.startsWith("CHECK") ? JSON.parse(title.slice(5)) : null;
"""

CLIPBOARD_TEXT = """
const t = Cc["@mozilla.org/widget/transferable;1"].createInstance(Ci.nsITransferable);
t.init(null);
t.addDataFlavor("text/plain");
Services.clipboard.getData(t, Ci.nsIClipboard.kGlobalClipboard, null);
const out = {};
try { t.getTransferData("text/plain", out); } catch { return ""; }
return out.value.QueryInterface(Ci.nsISupportsString).data;
"""


def settings_steps(client):
    """Opens the settings page as the Notice bar link does, then clicks Copy for GIPHY. True when
    the page opens scrolled to the steps and the GIPHY address lands on the clipboard."""
    client.execute_script(OPEN_CONTENT_TAB)
    state = None
    for _ in range(40):
        time.sleep(0.5)
        state = client.execute_script(SETTINGS_STATE)
        if state and state['copyAt']:
            break
    print('Settings page:', json.dumps(state))
    at_steps = bool(state) and state['shown'] and state['inView'] and state['scrolled']
    print('PASS: Notice bar link opens the settings page at the steps' if at_steps
          else 'FAIL: settings page did not open at the steps')
    if not (state and state['copyAt']):
        return False
    # A real click inside the page, as the user makes: the page is out of reach, so aim at its frame.
    popup = next(h for h in client.chrome_window_handles if client.switch_to_window(h) is None and
                 client.execute_script('return document.documentElement.getAttribute("windowtype")') == 'mail:extensionPopup')
    client.switch_to_window(popup)
    frame = client.find_element(By.CSS_SELECTOR, 'browser')
    width, height = client.execute_script('const r = arguments[0].getBoundingClientRect(); return [r.width, r.height];', script_args=[frame])
    x, y = state['copyAt']
    ActionSequence(client, 'pointer', 'mouse', {'pointerType': 'mouse'}) \
        .pointer_move(int(x - width / 2), int(y - height / 2), origin=frame).pointer_down().pointer_up().perform()
    time.sleep(1)
    copied = client.execute_script(CLIPBOARD_TEXT)
    copy_ok = copied == EXCEPTIONS[0]
    print(f'PASS: Copy puts {copied} on the clipboard, no permission needed' if copy_ok
          else f'FAIL: Copy left {copied!r} on the clipboard ({(client.execute_script(SETTINGS_STATE) or {}).get("status")})')
    return at_steps and copy_ok


def run_drafts(edition, cap=None):
    """Installs a check build of an Edition in a throwaway Thunderbird and tests both draft types.
    Returns True when the GIF is in the HTML draft as a link (shown for Live, blocked for the
    ATN edition) and its link lands in a plain-text draft."""
    print(f'--- {"Thundergif Live" if edition == "live" else "ATN edition"} ---')
    work = tempfile.mkdtemp(prefix='thundergif-check-')
    profile = os.path.join(work, 'profile')
    os.makedirs(profile)
    with open(os.path.join(profile, 'user.js'), 'w') as f:
        for key, value in PREFS.items():
            f.write(f'user_pref({json.dumps(key)}, {json.dumps(value)});\n')
    xpi, _ = build_check_xpi(work, edition, cap)
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
        images = html_draft_images(client, expect_shown=edition == 'live')
        linked = len(images) == len(GIF_URLS) and all(i['mozDoNotSend'] == 'true' for i in images)
        shown = linked and all(i['naturalWidth'] > 0 for i in images)
        if edition == 'live':
            html_ok = shown
            print('PASS: GIF shows in the HTML draft as a link' if html_ok else 'FAIL: GIF missing or not shown in the HTML draft')
        else:
            html_ok = linked and not shown
            print('PASS: GIF is in the HTML draft as a link, blocked as expected without the Experiment' if html_ok
                  else 'FAIL: GIF missing from the HTML draft, or unexpectedly shown')

        if edition == 'atn':
            # With one exception per Provider, the ATN edition's GIFs should show.
            client.execute_script(CLOSE_DRAFT)
            time.sleep(1)
            client.execute_script(ADD_EXCEPTIONS, script_args=[EXCEPTIONS])
            images = html_draft_images(client, expect_shown=True)
            excepted_ok = len(images) == len(GIF_URLS) and all(i['naturalWidth'] > 0 for i in images)
            print(f'PASS: GIFs show once {" and ".join(EXCEPTIONS)} are remote-content exceptions' if excepted_ok
                  else 'FAIL: GIFs still blocked with one exception per Provider')
            html_ok = html_ok and excepted_ok

        client.execute_script(CLOSE_DRAFT)
        time.sleep(1)
        client.execute_script(OPEN_DRAFT, script_args=[True])
        text = ''
        for _ in range(30):
            time.sleep(0.5)
            text = client.execute_script(DRAFT_TEXT) or ''
            if all(url in text for url in GIF_URLS):
                break
        plain_ok = all(url in text for url in GIF_URLS) and client.execute_script(DRAFT_IMAGES) == []
        print('PASS: GIF link typed into the plain-text draft' if plain_ok else f'FAIL: plain-text draft holds {text!r}')
        steps_ok = edition == 'live' or settings_steps(client)
        return html_ok and plain_ok and steps_ok
    finally:
        thunderbird.terminate()
        thunderbird.wait(timeout=30)
        shutil.rmtree(work, ignore_errors=True)


def main():
    major, version_text = installed_major()
    cap, cap_major = manifest_cap()
    print(f'Installed: {version_text}. Thundergif Live cap: {cap}. The ATN edition has no cap.')
    servers_ok = same_files_on_main_servers()
    print('Media servers: one per Provider is enough.' if servers_ok
          else 'Media servers: FAIL. Inserting from one server per Provider may now be wrong; see above.')
    atn_ok = run_drafts('atn')
    print('ATN edition: works on this Thunderbird.' if atn_ok else 'ATN edition: FAILS on this Thunderbird. A real fix is needed.')
    atn_ok = atn_ok and servers_ok
    if cap_major is None or cap_major >= major:
        live_ok = run_drafts('live')
        print('Thundergif Live: works on this Thunderbird.' if live_ok else 'Thundergif Live: FAILS on this Thunderbird. A real fix is needed, not just a cap change.')
        print('RESULT: all good on this Thunderbird.' if atn_ok and live_ok else 'RESULT: something fails; see above.')
        return 0 if atn_ok and live_ok else 1
    print(f'Thundergif Live\'s cap is {cap}, below Thunderbird {major}: Thunderbird would switch it off.')
    print(f'Testing Thundergif Live with the cap raised to {major}.* ...')
    live_ok = run_drafts('live', cap=f'{major}.*')
    if live_ok:
        print(f'RESULT: raise Thundergif Live\'s cap to {major}.* (it works). Run: npm run compat -- {major}')
    else:
        print('RESULT: Thundergif Live fails on this Thunderbird even with the cap raised. A real fix is needed.')
    return 1


sys.exit(main())
