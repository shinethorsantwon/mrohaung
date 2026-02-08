const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");

async function restoreFrontend() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "193.203.173.82",
            user: "u860480593.mrohaung.com",
            password: "SBCsmFTP1234!@#$",
            secure: false
        });

        console.log("🚑 RESTORING FRONTEND SERVER...");

        const standaloneDir = path.join(__dirname, "web", ".next", "standalone", "web");
        const serverPath = path.join(standaloneDir, "server.js");
        const packagePath = path.join(standaloneDir, "package.json");

        if (fs.existsSync(serverPath)) {
            await client.uploadFrom(serverPath, "/public_html/server.js");
            console.log("✅ Restored /public_html/server.js (Next.js)");
        } else {
            console.error("❌ Could not find local Next.js server.js! Please rebuild.");
            // Determine if we need to rebuild? No, build should persist.
        }

        if (fs.existsSync(packagePath)) {
            await client.uploadFrom(packagePath, "/public_html/package.json");
            console.log("✅ Restored /public_html/package.json");
        }

        console.log("🔄 Triggering Restart...");
        await client.ensureDir("/public_html/tmp");
        fs.writeFileSync("restart_restore.txt", "restart " + Date.now());
        await client.uploadFrom("restart_restore.txt", "/public_html/tmp/restart.txt");
        fs.unlinkSync("restart_restore.txt");
        console.log("✅ Restart trigger uploaded.");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        client.close();
    }
}

restoreFrontend();
