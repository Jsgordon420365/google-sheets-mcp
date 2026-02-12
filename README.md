# Google Sheets MCP

A Model Context Protocol (MCP) connector for Google Sheets that allows AI agents to interact with spreadsheets directly.

## Demo

<https://github.com/user-attachments/assets/cc4729d9-4e6e-437b-848b-6da9a09418c3>

## Setup

1. Clone this repository:

```bash
git clone https://github.com/Jsgordon420365/google-sheets-mcp
cd google-sheets-mcp
```

1. Install dependencies:
   `npm install`

2. Build:
   `npm run build`

3. Create OAuth credentials in Google Cloud Platform:
   - Create a new project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the [Google Sheets API](https://console.cloud.google.com/marketplace/product/google/sheets.googleapis.com)
   - Configure the OAuth consent screen
   - Create OAuth client ID credentials (Desktop application)
   - Download the credentials and save as `gcp-oauth.keys.json` in the **root** and the `dist` subdirectory.

4. **Initial Authentication**:
   Run the standalone auth script to generate your first token:
   `node auth-standalone.js`

5. **Start the MCP server**:
   `npm run start`

## Verification & Recovery

Following a system restart or environment change, follow these steps to ensure the **Executive System Bus** is operational.

### 1. Agent-Led Verification (Antigravity/Claude)

Ask your agent to perform a "Sentinel Handshake":

1. **Read**: Run `get_baton_status` or `read_rows` on the `Shift_Log` tab.
2. **Write**: Record a new entry using `record_shift_entry` with the action "System Recovery Verification".
3. **Confirm**: Verify the new row is visible in the spreadsheet.

### 2. Manual Verification (Gemini CLI)

If agents are offline, use the **Gemini CLI** for a direct pipe test:

1. **Open PowerShell** and navigate to the project directory.
2. **Launch Gemini**: Type `gemini`.
3. **Authenticate**: Type `/auth` to ensure the session is logged into your Google account.
4. **Read Test**: Use the CLI to read the last entry of the `Shift_Log`.
5. **Write Test**: Echo a new entry to the sheet: `"Recovery verify via Gemini CLI"`.

## Usage

Sample config for Claude Desktop (`%APPDATA%/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "google-sheets-mcp": {
      "command": "node",
      "args": ["C:\\Users\\YOUR_USER\\Projects\\google-sheets-mcp\\index.js"]
    }
  }
}
```

## Available Actions

| Action                | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| `refresh_auth`        | Re-authenticate your Google Account when credentials expire |
| `list_sheets`         | List all sheets/tabs in a Google Spreadsheet                |
| `create_sheet`        | Create a new sheet/tab in a Google Spreadsheet              |
| `create_spreadsheet`  | Create a new Google Spreadsheet                             |
| `read_all_from_sheet` | Read all data from a specified sheet                        |
| `read_headings`       | Read the column headings from a sheet                       |
| `read_rows`           | Read specific rows from a sheet                             |
| `read_columns`        | Read specific columns from a sheet                          |
| `edit_cell`           | Edit a single cell in a sheet                               |
| `edit_row`            | Edit an entire row in a sheet                               |
| `edit_column`         | Edit an entire column in a sheet                            |
| `insert_row`          | Insert a new row at specified position                      |
| `insert_column`       | Insert a new column at specified position                   |
| `rename_sheet`        | Rename a sheet/tab in a spreadsheet                         |
| `rename_doc`          | Rename a Google Spreadsheet                                 |
| `record_shift_entry`  | Record a shift in the Handoff Ledger (Shift_Log)            |
| `get_baton_status`    | Check who currently has the 'Baton'                         |
| `append_row`          | Append a row of values to the end of a sheet                |
| `call_apps_script`    | Trigger custom logic (like Temporal Handshake) via URL      |

## Multi-LLM Handoff Protocol (Baton Sync)

This server is optimized for the **Adam, Ben, and Cindy Protocol**, allowing multiple LLMs (Gemini, Claude, ChatGPT) to maintain a synchronized state via a `Shift_Log` tab. For more details on the underlying philosophy, see [THE_LIVING_LEDGER.md](./THE_LIVING_LEDGER.md).

### **The Protocol Rules:**

1. **Check Status**: Before starting any task, run `get_baton_status` to see the latest shift entry and handoff notes.
2. **Identify Yourself**: When recording an entry, use your agent name (e.g., "Gemini", "Claude", "ChatGPT").
3. **Temporal Handshake**: Use `call_apps_script` with the action `temporal_handshake` to sync timestamps if required by the Apps Script logic.
4. **Passing the Baton**: When your shift ends, run `record_shift_entry` with a summary of `actionTaken` and clear `handoffNotes` for the next agent.

### **Apps Script Integration**

- **URL**: `https://script.google.com/macros/s/AKfycbwTx6nUZqmXlH5g_mVCwxPctXe2lR0Y1Hy256TQVOLifAiPu0yJZYvkQywccyxJ38Gs/exec`
- **Action**: `temporal_handshake`
- **Spreadsheet ID**: `1LVcmsIKdgd5uf1K79EtGMgd7epD53x6OBO4cgi7GC9Q`

## Maintenance Notes (Patch 0.0.2)

- **OAuth Stability Fix**: Added explicit client ID/secret loading from `gcp-oauth.keys.json` to prevent refresh token failures.
- **Pathing**: Optimized for Windows environments; ensure `gcp-oauth.keys.json` exists in both root and `dist`.

## License

MIT
