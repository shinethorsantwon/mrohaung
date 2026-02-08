const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs-extra");
require("dotenv").config();

async function deploy() {
    const webDir = path.join(__dirname, "web");
    const webNextDir = path.join(webDir, ".next");
    const standaloneDir = path.join(webNextDir, "standalone", "web");

    // Timestamp for backup names
    const ts = Date.now();

    console.log("--- FINAL FIX DEPLOYMENT (Rename Strategy) ---\n");

    try {
        if (!fs.existsSync(standaloneDir)) {
            console.error("Build not found! Please run 'cd web && npm run build' first.");
            process.exit(1);
        }

        // Prepare assets
        const nextStaticSource = path.join(webNextDir, "static");
        const publicSource = path.join(webDir, "public");
        const targetNextStatic = path.join(standaloneDir, ".next", "static");
        const targetPublic = path.join(standaloneDir, "public");

        await fs.ensureDir(path.join(standaloneDir, ".next"));

        if (fs.existsSync(nextStaticSource)) {
            await fs.copy(nextStaticSource, targetNextStatic);
            console.log("✓ Prepared .next/static");
        }

        if (fs.existsSync(publicSource)) {
            await fs.copy(publicSource, targetPublic);
            console.log("✓ Prepared public/");
        }

        console.log("\n🔌 Connecting to Hostinger...");
        const client = new ftp.Client();
        // client.ftp.verbose = true; // Uncomment for debugging

        await client.access({
            host: "193.203.173.82",
            user: "u860480593.mrohaung.com",
            password: "SBCsmFTP1234!@#$",
            secure: false
        });

        // Navigate to public_html
        await client.cd("/public_html");

        console.log("📦 Backup old files (Rename instead of Delete)...");

        const filesToRename = ['.next', 'public', 'node_modules', 'server.js', 'package.json', '.env.production'];

        for (const item of filesToRename) {
            try {
                // Check if file exists
                // We use rename directly, if it fails (not exists) it throws error which we catch
                const backupName = `${item}_backup_${ts}`;
                await client.rename(item, backupName);
                console.log(`  ✓ Renamed ${item} -> ${backupName}`);
            } catch (e) {
                // Ignore errors (file might not exist)
                // console.log(`  (Note: ${item} not renamed: ${e.message})`);
            }
        }

        console.log("\n📤 Uploading fresh build...");

        // Upload each item
        const items = fs.readdirSync(standaloneDir);
        for (const item of items) {
            const localPath = path.join(standaloneDir, item);
            const stat = fs.statSync(localPath);

            if (stat.isDirectory()) {
                console.log(`  Uploading directory: ${item}/`);
                await client.uploadFromDir(localPath, item);
            } else {
                console.log(`  Uploading file: ${item}`);
                await client.uploadFrom(localPath, item);
            }
        }

        console.log("\n---------------------------------------------------");
        console.log("🚀 DEPLOYMENT SUCCESSFUL!");
        console.log("Site is live at: https://mrohaung.com");
        console.log("PLEASE RESTART YOUR NODE SERVER ON HOSTINGER NOW!");
        console.log("---------------------------------------------------");

        client.close();

    } catch (err) {
        console.error("\n❌ DEPLOYMENT FAILED!");
        console.error(err);
        process.exit(1);
    }
}

deploy();
