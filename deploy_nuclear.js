const ftp = require("basic-ftp");
require("dotenv").config();

async function nukeAndDeploy() {
    const path = require("path");
    const fs = require("fs-extra");

    const webDir = path.join(__dirname, "web");
    const webNextDir = path.join(webDir, ".next");
    const standaloneDir = path.join(webNextDir, "standalone", "web");

    const client = new ftp.Client();

    try {
        console.log("--- NUCLEAR DEPLOYMENT (Clean Slate) ---\n");

        if (!fs.existsSync(standaloneDir)) {
            console.error("Build not found! Run 'cd web && npm run build' first.");
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
        await client.access({
            host: "193.203.173.82",
            user: "u860480593.mrohaung.com",
            password: "SBCsmFTP1234!@#$",
            secure: false
        });

        // Go to parent directory and delete entire public_html
        console.log("💣 NUKING old public_html...");
        try {
            await client.cd("/");
            await client.removeDir("public_html");
            console.log("  ✓ Old public_html deleted");
        } catch (e) {
            console.log("  Note:", e.message);
        }

        // Recreate public_html
        console.log("📁 Creating fresh public_html...");
        await client.ensureDir("public_html");
        await client.cd("public_html");

        console.log("📤 Uploading fresh build...\n");

        // Upload each item
        const items = fs.readdirSync(standaloneDir);
        for (const item of items) {
            const localPath = path.join(standaloneDir, item);
            const stat = fs.statSync(localPath);

            if (stat.isDirectory()) {
                console.log(`  📂 ${item}/`);
                await client.uploadFromDir(localPath, item);
            } else {
                console.log(`  📄 ${item}`);
                await client.uploadFrom(localPath, item);
            }
        }

        console.log("\n---------------------------------------------------");
        console.log("🚀 NUCLEAR DEPLOYMENT COMPLETE!");
        console.log("Site is live at: https://mrohaung.com");
        console.log("---------------------------------------------------");

    } catch (err) {
        console.error("\n❌ DEPLOYMENT FAILED!");
        console.error(err);
        process.exit(1);
    } finally {
        client.close();
    }
}

nukeAndDeploy();
