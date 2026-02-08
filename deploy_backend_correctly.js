const ftp = require("basic-ftp");
const fs = require("fs");
const path = require("path");

async function deployBackendCorrectly() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "193.203.173.82",
            user: "u860480593.mrohaung.com",
            password: "SBCsmFTP1234!@#$",
            secure: false
        });

        console.log("🚀 DEPLOYING BACKEND TO /public_html/api ...");

        const backendIndex = path.join(__dirname, "backend", "index.js");
        if (fs.existsSync(backendIndex)) {
            await client.uploadFrom(backendIndex, "/public_html/api/index.js");
            console.log("✅ Updated /public_html/api/index.js");
        } else {
            console.error("❌ Local backend/index.js missing!");
        }

        // Trigger restart for API sub-app
        console.log("🔄 Triggering API Restart...");
        try {
            await client.ensureDir("/public_html/api/tmp");
            fs.writeFileSync("restart_api.txt", "restart " + Date.now());
            await client.uploadFrom("restart_api.txt", "/public_html/api/tmp/restart.txt");
            fs.unlinkSync("restart_api.txt");
            console.log("✅ Uploaded /public_html/api/tmp/restart.txt");
        } catch (e) {
            console.log("Could not upload API restart trigger: " + e.message);
        }

        console.log("All updates complete. Check site in 1 minute.");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        client.close();
    }
}

deployBackendCorrectly();
