import { authenticate } from "@google-cloud/local-auth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gcpKeysPath = path.join(__dirname, "dist", "gcp-oauth.keys.json");
const credentialsPath = path.join(__dirname, "dist", ".gsheets-server-credentials.json");

console.log("Starting OAuth flow...");
console.log("Browser will open for authorization...");

const auth = await authenticate({
    keyfilePath: gcpKeysPath,
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file"
    ],
});

console.log("Authentication successful!");

// Save credentials
const credentials = {
    type: "authorized_user",
    client_id: auth._clientId,
    client_secret: auth._clientSecret,
    refresh_token: auth.credentials.refresh_token,
};

fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
console.log(`Credentials saved to: ${credentialsPath}`);
console.log("\nYou can now restart Claude Desktop to use the Google Sheets MCP server!");

process.exit(0);
