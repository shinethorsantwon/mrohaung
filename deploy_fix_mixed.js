const ftp = require("basic-ftp");
const fs = require("fs-extra");
const path = require("path");

async function fixMixedContent() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "193.203.173.82",
            user: "u860480593.mrohaung.com",
            password: "SBCsmFTP1234!@#$",
            secure: false
        });

        console.log("🔥 FIXING MIXED CONTENT IN .next FOLDER...");
        await client.cd("/public_html");

        // 1. Rename existing .next to move it out of the way
        const timestamp = Date.now();
        console.log("📦 Backup/Move old .next folder...");
        try {
            await client.rename(".next", `.next_trash_${timestamp}`);
            console.log("✅ Moved .next to trash.");
        } catch (e) {
            console.log("Info: .next might not exist or verify renaming.", e.message);
        }

        // 2. Create fresh .next
        await client.ensureDir(".next");

        // 3. Upload local .next
        console.log("📤 Uploading clean .next folder...");
        const localNext = path.join(__dirname, "web", ".next");

        // We upload contents of local .next to remote .next
        await client.uploadFromDir(localNext, ".next");

        console.log("✅ Upload complete.");

        // 4. Restart
        console.log("🔄 Triggering Restart...");
        await client.ensureDir("tmp");
        fs.writeFileSync("restart_fix.txt", "restart");
        await client.uploadFrom("restart_fix.txt", "tmp/restart.txt");
        fs.unlinkSync("restart_fix.txt");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        client.close();
    }
}

fixMixedContent();
