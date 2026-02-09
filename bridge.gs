// Multi-LLM Coordination Ledger - Apps Script (Middle Path Edition)
// Enhanced to support "Writing via GET" so ChatGPT can give you a clickable link.

const CONFIG = {
  SHEETS: {
    LEDGER: 'Ledger',
    FULL: 'FullResponses',
    SHIFT: 'Shift_Log'
  },

  HEADERS: {
    LEDGER: ['a_now', 'general_id', 'specific_id', 'epsilon', 'prompt_preview', 'response_preview', 'full_response_url', 'status', 'validation_notes'],
    FULL: ['a_now', 'full_response'],
    SHIFT: ['Timestamp', 'Agent', 'Action Taken', 'handoffNotes', 'batonStatus']
  },

  REQUIRE_KEY: false,
  SCRIPT_PROP_KEY_NAME: 'LEDGER_API_KEY',

  PREVIEW: {
    PROMPT: 100,
    RESPONSE: 100
  }
};

function doGet(e) {
  try {
    ensureSheetsAndHeaders_();
    const qs = (e && e.parameter) ? e.parameter : {};
    const action = qs.action || 'status';

    if (qs.ui === 'writeEntry') {
      return HtmlService.createHtmlOutputFromFile('WriterUI');
    }

    // --- MIDDLE PATH: ALLOW WRITING VIA GET ---
    if (action === 'append') {
      const res = appendEntry_(qs.timestamp, qs.general_id, qs.specific_id, qs.epsilon, qs.prompt, qs.response);
      return renderSuccess_("Ledger Entry Recorded", res);
    }

    if (action === 'recordShiftEntry') {
      const res = recordShiftEntry_(qs.timestamp, qs.agent, qs.actionTaken, qs.handoffNotes, qs.batonStatus);
      return renderSuccess_("Shift Log Recorded", res);
    }
    // ------------------------------------------

    if (action === 'status') {
      return json_({ status: 'online', message: 'Multi-LLM Coordination Ledger API', sheets_ok: true });
    }

    if (action === 'getShiftLast') {
      return json_(getShiftLast_(qs.n || 10));
    }

    return json_({ error: 'Unknown action: ' + action }, 400);
  } catch (err) {
    return json_({ error: err.toString() }, 500);
  }
}

function doPost(e) {
  try {
    ensureSheetsAndHeaders_();
    const body = parseJsonBody_(e);
    const action = body.action;

    if (action === 'append') {
      return json_(appendEntry_(body.timestamp, body.general_id, body.specific_id, body.epsilon, body.prompt, body.response));
    }
    if (action === 'recordShiftEntry') {
      return json_(recordShiftEntry_(body.timestamp, body.agent, body.actionTaken, body.handoffNotes, body.batonStatus));
    }
    return json_({ error: 'Unknown action: ' + action }, 400);
  } catch (err) {
    return json_({ error: err.toString() }, 500);
  }
}

/* --- Core Logic (Unchanged from your working code) --- */

function appendEntry_(timestamp, general_id, specific_id, epsilon, prompt, response) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ledgerSheet = ss.getSheetByName(CONFIG.SHEETS.LEDGER);
  const fullTextSheet = ss.getSheetByName(CONFIG.SHEETS.FULL);
  const a_now = normalizeANow_(timestamp);
  fullTextSheet.appendRow([a_now, (response || '').toString()]);
  const responseUrl = `https://docs.google.com/spreadsheets/d/${ss.getId()}/edit#gid=${fullTextSheet.getSheetId()}&range=A${fullTextSheet.getLastRow()}`;
  const isValid = validateSpecificId_(a_now, specific_id);
  ledgerSheet.appendRow([a_now, (general_id || '').toString(), (specific_id || '').toString(), (epsilon || '').toString(), (prompt || '').substring(0, CONFIG.PREVIEW.PROMPT), (response || '').substring(0, CONFIG.PREVIEW.RESPONSE), responseUrl, isValid ? 'VALID' : 'INVALID', isValid ? '' : getValidationError_(a_now, specific_id)]);
  return { success: true, row: ledgerSheet.getLastRow(), status: isValid ? 'VALID' : 'INVALID' };
}

function recordShiftEntry_(timestamp, agent, actionTaken, handoffNotes, batonStatus) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shiftSheet = ss.getSheetByName(CONFIG.SHEETS.SHIFT);
  const ts = normalizeIsoOrKeep_(timestamp);
  shiftSheet.appendRow([ts, (agent || '').toString(), (actionTaken || '').toString(), (handoffNotes || '').toString(), (batonStatus || 'ACTIVE').toString()]);
  return { success: true, row: shiftSheet.getLastRow() };
}

function getShiftLast_(n) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.SHIFT);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  const numRows = Math.min(parseInt(n, 10) || 10, lastRow - 1);
  const values = sheet.getRange(lastRow - numRows + 1, 1, numRows, CONFIG.HEADERS.SHIFT.length).getValues();
  return values.map(row => ({ timestamp: row[0], agent: row[1], action_taken: row[2], handoff_notes: row[3], baton_status: row[4] }));
}

function renderSuccess_(title, data) {
  const html = `<html><body style="font-family:sans-serif;padding:40px;text-align:center;">
    <h1 style="color:#2e7d32;">✅ ${title}</h1>
    <p>Entry successfully added to Row ${data.row}.</p>
    <button onclick="window.close()" style="padding:10px 20px;cursor:pointer;">Close This Tab</button>
    <pre style="text-align:left;background:#f5f5f5;padding:10px;margin-top:20px;">${JSON.stringify(data, null, 2)}</pre>
  </body></html>`;
  return HtmlService.createHtmlOutput(html);
}

function normalizeANow_(t) { return t || formatDateToANow_(new Date()); }
function normalizeIsoOrKeep_(t) { return t || new Date().toISOString(); }
function formatDateToANow_(d) { return d.getUTCFullYear() + (d.getUTCMonth()+1).toString().padStart(2,'0') + d.getUTCDate().toString().padStart(2,'0') + d.getUTCHours().toString().padStart(2,'0') + d.getUTCMinutes().toString().padStart(2,'0') + d.getUTCSeconds().toString().padStart(2,'0'); }
function validateSpecificId_(t, s) { return true; } // Placeholder: your Code.gs contains the real logic
function getValidationError_(t, s) { return ''; } // Placeholder
function ensureSheetsAndHeaders_() { /* logic from your Code.gs */ }
function parseJsonBody_(e) { return JSON.parse(e.postData.contents); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
