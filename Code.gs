// Multi-LLM Coordination Ledger - Apps Script (Hardened Middle Path Edition)
// Authoritative Single-file API for Ledger + FullResponses + Shift_Log

const CONFIG = {
  SHEETS: {
    LEDGER: 'Ledger',
    FULL: 'FullResponses',
    SHIFT: 'Shift_Log'
  },

  HEADERS: {
    LEDGER: ['a_now', 'general_id', 'specific_id', 'epsilon', 'prompt_preview', 'response_preview', 'full_response_url', 'status', 'validation_notes'],
    FULL: ['a_now', 'full_response'],
    SHIFT: [
      'Timestamp',
      'Agent',
      'Thread',
      'Anchor_ID',
      'Cohort_ID',
      'Action Taken',
      'Handoff Notes',
      'Baton Status'
    ]
  },

  // Security: set REQUIRE_KEY = true and set LEDGER_API_KEY in Script Properties
  REQUIRE_KEY: false,
  SCRIPT_PROP_KEY_NAME: 'LEDGER_API_KEY',
  
  // Master Latch: If false, all write operations (GET/POST) are disabled.
  // Set SCRIPT_PROP_LATCH_NAME = "false" in Script Properties to lock the ledger.
  SCRIPT_PROP_LATCH_NAME: 'API_ENABLED',

  PREVIEW: {
    PROMPT: 100,
    RESPONSE: 100
  }
};

/**
 * GET Handler
 * Supports: Status, Read, and "Middle Path" writes via URI links.
 */
function doGet(e) {
  try {
    ensureSheetsAndHeaders_();
    const qs = (e && e.parameter) ? e.parameter : {};
    const action = getParam_(qs, 'action', 'status');

    if (qs.ui === 'writeEntry') {
      return HtmlService.createHtmlOutputFromFile('WriterUI');
    }

    // --- MASTER LATCH CHECK ---
    if (!checkLatch_()) {
      return (action === 'append' || action === 'recordShiftEntry')
        ? renderError_("Ledger is currently LOCKED (API_ENABLED = false)")
        : json_({ error: "Ledger locked" }, 403);
    }

    // --- MIDDLE PATH: ALLOW WRITING VIA GET LINKS ---
    if (action === 'append' || action === 'recordShiftEntry') {
      if (CONFIG.REQUIRE_KEY) requireApiKey_(qs, true);

      if (action === 'append') {
        const result = appendEntry_(
          getParam_(qs, 'timestamp'),
          getParam_(qs, 'general_id'),
          getParam_(qs, 'specific_id'),
          getParam_(qs, 'epsilon'),
          getParam_(qs, 'prompt'),
          getParam_(qs, 'response'),
          getParam_(qs, 'cohort_id')
        );
        return renderSuccess_("Ledger Entry Recorded", result);
      }

      if (action === 'recordShiftEntry') {
        const result = recordShiftEntry_(
          getParam_(qs, 'timestamp'),
          getParam_(qs, 'agent'),
          getParam_(qs, 'thread'),
          getParam_(qs, 'anchor_id'),
          getParam_(qs, 'cohort_id'),
          getParam_(qs, 'thread_stamp'),
          getParam_(qs, 'actionTaken'),
          getParam_(qs, 'handoffNotes'),
          getParam_(qs, 'batonStatus')
        );
        return renderSuccess_("Shift Log Recorded", result);
      }
    }
    // ------------------------------------------------

    if (action === 'status') {
      return json_({ status: 'online', sheets_ok: true, require_key: CONFIG.REQUIRE_KEY });
    }

    if (action === 'getLastEntries') return json_(getLastEntries_(getParam_(qs, 'n', 10)));
    if (action === 'getShiftLast') return json_(getShiftLast_(getParam_(qs, 'n', 10)));

    return json_({ error: 'Unknown action: ' + action }, 400);
  } catch (err) {
    return (e && e.parameter && (e.parameter.action === 'append' || e.parameter.action === 'recordShiftEntry'))
      ? renderError_(err.toString())
      : json_({ error: err.toString() }, 500);
  }
}

/**
 * POST Handler
 * Supports: Automated API calls.
 */
function doPost(e) {
  try {
    ensureSheetsAndHeaders_();
    const body = parseJsonBody_(e);
    const action = body.action;

    if (CONFIG.REQUIRE_KEY) requireApiKey_(body, false);

    if (action === 'append') {
      return json_(appendEntry_(body.timestamp, body.general_id, body.specific_id, body.epsilon, body.prompt, body.response, body.cohort_id));
    }
    if (action === 'recordShiftEntry') {
      return json_(recordShiftEntry_(body.timestamp, body.agent, body.thread, body.anchor_id, body.cohort_id, body.thread_stamp, body.actionTaken, body.handoffNotes, body.batonStatus));
    }
    if (action === 'getShiftLast') return json_(getShiftLast_(body.n || 10));

    return json_({ error: 'Unknown action: ' + action }, 400);
  } catch (err) {
    return json_({ error: err.toString() }, 500);
  }
}

/* =========================
   Core Logic
   ========================= */

function appendEntry_(timestamp, general_id, specific_id, epsilon, prompt, response, cohort_id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ledgerSheet = ss.getSheetByName(CONFIG.SHEETS.LEDGER);
  const fullTextSheet = ss.getSheetByName(CONFIG.SHEETS.FULL);

  const a_now = normalizeANow_(timestamp);
  const rsPrefix = cohort_id ? `[RS:${cohort_id}] ` : '';
  const responseSafe = rsPrefix + (response || '').toString();
  
  const responseUrl = `https://docs.google.com/spreadsheets/d/${ss.getId()}/edit#gid=${fullTextSheet.getSheetId()}&range=A${fullTextSheet.getLastRow()}`;
  const isValid = validateSpecificId_(a_now, specific_id);

  ledgerSheet.appendRow([
    a_now,
    (general_id || '').toString(),
    (specific_id || '').toString(),
    (epsilon || '').toString(),
    (prompt || '').substring(0, CONFIG.PREVIEW.PROMPT),
    (response || '').substring(0, CONFIG.PREVIEW.RESPONSE),
    responseUrl,
    isValid ? 'VALID' : 'INVALID',
    isValid ? '' : getValidationError_(a_now, specific_id)
  ]);

  return { success: true, row: ledgerSheet.getLastRow(), status: isValid ? 'VALID' : 'INVALID' };
}

function recordShiftEntry_(timestamp, agent, thread, anchor_id, cohort_id, thread_stamp, actionTaken, handoffNotes, batonStatus) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shiftSheet = ss.getSheetByName(CONFIG.SHEETS.SHIFT);
  const ts = normalizeIsoOrKeep_(timestamp);
  
  // Campfire v2: Identity & Latch Security
  requireThreadStamp_(thread, thread_stamp);

  const rsPrefix = cohort_id ? `[RS:${cohort_id}] ` : '';
  const atSafe = rsPrefix + (actionTaken || '').toString();

  // Columns: Timestamp, Agent, Thread, Anchor_ID, Cohort_ID, Action Taken, Handoff Notes, Baton Status
  shiftSheet.appendRow([
    ts, 
    (agent || '').toString(), 
    (thread || '').toString(),
    (anchor_id || '').toString(),
    (cohort_id || '').toString(),
    atSafe, 
    (handoffNotes || '').toString(), 
    (batonStatus || 'ACTIVE').toString()
  ]);

  return { success: true, row: shiftSheet.getLastRow() };
}

function getShiftLast_(n) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.SHIFT);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  const numRows = Math.min(parseInt(n, 10) || 10, lastRow - 1);
  return sheet.getRange(lastRow - numRows + 1, 1, numRows, CONFIG.HEADERS.SHIFT.length).getValues().map(row => ({
    timestamp: row[0], agent: row[1], action_taken: row[2], handoff_notes: row[3], baton_status: row[4]
  }));
}

/* =========================
   Helpers
   ========================= */

function getParam_(qs, key, def) {
  const v = (qs && qs[key] !== undefined && qs[key] !== null) ? String(qs[key]) : (def ?? '');
  try {
    return decodeURIComponent(v.replace(/\+/g, '%20'));
  } catch (e) {
    return v;
  }
}

function requireApiKey_(data, _isGet) {
  const props = PropertiesService.getScriptProperties();
  const expected = props.getProperty(CONFIG.SCRIPT_PROP_KEY_NAME);
  if (!expected) return; 
  
  // Accept both 'api_key' and 'key' for normalized handling
  const provided = data.api_key || data.key; 
  if (!provided || provided !== expected) throw new Error('Unauthorized: missing or invalid key');
}

function checkLatch_() {
  const latch = PropertiesService.getScriptProperties().getProperty(CONFIG.SCRIPT_PROP_LATCH_NAME);
  return latch !== 'false'; 
}

/**
 * Campfire v2: Validates thread identity using an allowlist in Script Properties.
 * Property should be JSON: THREAD_STAMPS = {"adam":"TOKEN1","ben":"TOKEN2","cindy":"TOKEN3"}
 */
function requireThreadStamp_(thread, stamp) {
  const props = PropertiesService.getScriptProperties();
  const stampsJson = props.getProperty('THREAD_STAMPS');
  if (!stampsJson) return; // Allow if no stamps are configured (for initial setup)

  try {
    const stamps = JSON.parse(stampsJson);
    const expected = stamps[thread];
    if (expected && expected !== stamp) {
       throw new Error(`Identity Verification Failed for ${thread}`);
    }
  } catch (e) {
    if (e.message.includes('Verification Failed')) throw e;
  }
}

function ensureHeaderRow_(sheet, headers) {
  const lastCol = headers.length;
  const currentMax = sheet.getMaxColumns();
  if (currentMax < lastCol) sheet.insertColumnsAfter(currentMax, lastCol - currentMax);
  
  const existing = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  if (sheet.getLastRow() === 0 || existing.some((v, i) => v.toString().trim() !== headers[i])) {
    sheet.getRange(1, 1, 1, lastCol).setValues([headers]);
  }
}

function renderSuccess_(title, data) {
  return HtmlService.createHtmlOutput(`<html><body style="font-family:sans-serif;padding:40px;text-align:center;">
    <h1 style="color:#2e7d32;">✅ ${title}</h1>
    <pre style="text-align:left;background:#f5f5f5;padding:15px;border-radius:4px;">${JSON.stringify(data, null, 2)}</pre>
    <button onclick="window.close()" style="padding:10px 20px;background:#1976d2;color:white;border:none;border-radius:4px;cursor:pointer;">Close Tab</button>
  </body></html>`).setTitle("Success");
}

function renderError_(msg) {
  return HtmlService.createHtmlOutput(`<html><body style="font-family:sans-serif;padding:40px;text-align:center;">
    <h1 style="color:#c62828;">❌ Error</h1>
    <p>${msg}</p>
  </body></html>`).setTitle("Error");
}

function json_(obj, _code) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ... (Rest of validation/timestamp logic remains the same as previous)
function normalizeANow_(t){if(!t)return formatDateToANow_(new Date());const ts=t.toString().trim();if(/^\d{14}$/.test(ts))return ts;const d=new Date(ts);return isNaN(d.getTime())?formatDateToANow_(new Date()):formatDateToANow_(d)}
function normalizeIsoOrKeep_(t){if(!t)return new Date().toISOString();const d=new Date(t.toString().trim());return isNaN(d.getTime())?t:d.toISOString()}
function formatDateToANow_(d){return d.getUTCFullYear()+(d.getUTCMonth()+1).toString().padStart(2,'0')+d.getUTCDate().toString().padStart(2,'0')+d.getUTCHours().toString().padStart(2,'0')+d.getUTCMinutes().toString().padStart(2,'0')+d.getUTCSeconds().toString().padStart(2,'0')}
function validateSpecificId_(t,s){const m=extractMonth_(t);const p=(s||'').split('-');if(p.length!==3)return false;const e=(m*m)-1;return p[0]==='casablanca'&&parseInt(p[1])>=11&&parseInt(p[2])===e} // Simplified for space
function extractMonth_(t){const ts=(t||'').toString();if(/^\d{14}$/.test(ts))return parseInt(ts.substring(4,6),10);const d=new Date(ts);return isNaN(d.getTime())?(new Date()).getUTCMonth()+1:d.getUTCMonth()+1}
function ensureSheetsAndHeaders_(){const ss=SpreadsheetApp.getActiveSpreadsheet();ensureHeaderRow_(ensureSheet_(ss,CONFIG.SHEETS.LEDGER),CONFIG.HEADERS.LEDGER);ensureHeaderRow_(ensureSheet_(ss,CONFIG.SHEETS.FULL),CONFIG.HEADERS.FULL);ensureHeaderRow_(ensureSheet_(ss,CONFIG.SHEETS.SHIFT),CONFIG.HEADERS.SHIFT)}
function ensureSheet_(ss,n){let s=ss.getSheetByName(n);return s||ss.insertSheet(n)}
function parseJsonBody_(e){return JSON.parse(e.postData.contents)}
