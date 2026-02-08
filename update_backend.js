const ftp = require("basic-ftp");
const fs = require("fs");
const path = require("path");

async function updateBackendAndRestart() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "193.203.173.82",
            user: "u860480593.mrohaung.com",
            password: "SBCsmFTP1234!@#$",
            secure: false
        });

        console.log("Connected. Updating backend code...");

        // Upload backend/index.js as server.js
        const backendPath = path.join(__dirname, "backend", "index.js");
        if (fs.existsSync(backendPath)) {
            await client.uploadFrom(backendPath, "/public_html/server.js");
            console.log("✅ Uploaded backend/index.js -> /public_html/server.js");
        } else {
            console.error("❌ backend/index.js not found locally!");
            return;
        }

        // Delete conflicting .htaccess in api folder
        try {
            await client.remove("/public_html/api/.htaccess");
            console.log("✅ Removed potential conflicting .htaccess in /api");
        } catch (e) {
            console.log("  (No .htaccess in /api to remove, or error accessing it)");
        }

        // Trigger Restart
        console.log("🔄 Triggering Server Restart...");
        try {
            await client.ensureDir("/public_html/tmp");
            // Create dummy file
            fs.writeFileSync("restart_trigger.txt", "restart " + Date.now());
            await client.uploadFrom("restart_trigger.txt", "/public_html/tmp/restart.txt");
            fs.unlinkSync("restart_trigger.txt");
            console.log("✅ Uploaded tmp/restart.txt");
        } catch (e) {
            console.log("❌ Failed to upload restart.txt: " + e.message);
        }

        console.log("Refreshed backend code. Please wait 1 minute for restart.");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        client.close();
    }
}

updateBackendAndRestart();
