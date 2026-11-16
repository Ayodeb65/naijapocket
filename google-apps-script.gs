/**
 * NaijaPocket — early-access sign-ups → Google Sheet
 * ---------------------------------------------------
 * Paste this whole file into Extensions → Apps Script of your Google Sheet,
 * then Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * Copy the Web app URL into CONFIG.SIGNUP_ENDPOINT in app.js. See SETUP.md.
 * Free: runs on your Google account; no card, no paid service.
 */

const SHEET_NAME = 'Signups';
const HEADERS = ['Timestamp', 'Name', 'WhatsApp', 'State', 'Interests', 'Consent', 'Source', 'Page', 'Duplicate?'];
const VALID_STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta',
  'Ebonyi','Edo','Ekiti','Enugu','FCT – Abuja','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara',
  'Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara','Outside Nigeria'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const p = (e && e.parameter) || {};

    // Basic server-side checks (never trust the browser alone)
    if (p.website) return json_({ ok: true }); // honeypot filled → bot, silently ignore
    const name = clean_(p.name, 80);
    const phone = String(p.phone || '').trim();
    const state = clean_(p.state, 40);
    if (name.length < 2) return json_({ ok: false, error: 'name' });
    if (!/^\+234[789][01]\d{8}$/.test(phone)) return json_({ ok: false, error: 'phone' });
    if (VALID_STATES.indexOf(state) === -1) return json_({ ok: false, error: 'state' });
    if (p.consent !== 'yes') return json_({ ok: false, error: 'consent' });

    const sheet = getSheet_();
    const last = sheet.getLastRow();
    let duplicate = '';
    if (last > 1) {
      const phones = sheet.getRange(2, 3, last - 1, 1).getValues().map(function (r) { return String(r[0]); });
      if (phones.indexOf(phone) !== -1) duplicate = 'yes';
    }

    sheet.appendRow([
      new Date(), name, phone, state,
      clean_(p.interests, 200), 'yes', clean_(p.source, 100), clean_(p.page, 300), duplicate
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Lets you open the Web app URL in a browser to check it is live.
function doGet() {
  return json_({ ok: true, service: 'NaijaPocket early access' });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.getRange('C:C').setNumberFormat('@'); // keep +234 numbers as text
  }
  return sheet;
}

// Strips leading = + - @ so a sign-up can't inject a spreadsheet formula.
function clean_(v, max) {
  return String(v || '').trim().slice(0, max).replace(/^[=+\-@]+/, '');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
