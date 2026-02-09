const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

async function cleanAndDeploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    const config = {
        host: "193.203.173.82",
        user: "u860480593.mrohaung.com",
        password: "SBCsmFTP1234!@#$",
        secure: false
    };

    /**
     * Recursively uploads a directory to the FTP server.
     */
    async function uploadDir(localPath, remotePath) {
        const items = fs.readdirSync(localPath);
        for (const item of items) {
            const localItemPath = path.join(localPath, item);
            const remoteItemPath = path.posix.join(remotePath, item);
            const stats = fs.statSync(localItemPath);

            if (item === 'node_modules' || item === '.git' || item === '.next' || item === 'deploy_temp' || item == 'deploy_package.zip' || item == 'build_output.txt') {
                continue;
            }

            if (stats.isDirectory()) {
                await client.ensureDir(remoteItemPath);
                await uploadDir(localItemPath, remoteItemPath);
            } else {
                await client.uploadFrom(localItemPath, remoteItemPath);
            }
        }
    }

    try {
        console.log("🚀 Starting CLEANUP AND FRESH DEPLOYMENT...");
        await client.access(config);
        console.log("✅ Connected.");

        const remoteRoot = "/public_html";

        // 1. DELETE EVERYTHING IN PUBLIC_HTML FIRST TO REMOVE GARBAGE
        console.log("🧹 Cleaning up public_html directory...");
        try {
            // We use simple removal for common garbage patterns we know
            // or we list and remove. List is safer than recursive delete of root.
            const list = await client.list(remoteRoot);
            for (const item of list) {
                // Keep 'uploads' folder if it contains user data, otherwise delete it
                if (item.name === 'uploads') continue;

                const remotePath = path.posix.join(remoteRoot, item.name);
                if (item.isDirectory) {
                    console.log(`🗑️ Removing folder: ${item.name}`);
                    await client.removeDir(remotePath);
                } else {
                    console.log(`🗑️ Removing file: ${item.name}`);
                    await client.remove(remotePath);
                }
            }
        } catch (e) {
            console.error("⚠️ Cleanup warning (some files might be locked):", e.message);
        }

        // 2. RE-UPLOAD FRESH FILES
        console.log("📤 Uploading fresh root files...");
        await client.uploadFrom("index.js", path.posix.join(remoteRoot, "index.js"));
        await client.uploadFrom(".env", path.posix.join(remoteRoot, ".env"));
        await client.uploadFrom("package.json", path.posix.join(remoteRoot, "package.json"));

        console.log("📤 Uploading fresh Frontend (Static)...");
        await uploadDir("web/out", remoteRoot);

        console.log("📤 Uploading fresh Backend...");
        await client.ensureDir(path.posix.join(remoteRoot, "backend"));
        await uploadDir("backend", path.posix.join(remoteRoot, "backend"));

        // 3. RE-CREATE HTACCESS
        console.log("📄 Creating .htaccess...");
        const htaccessContent = `
# ============================================
# MROHAUNG PRODUCTION CONFIG (CLEAN)
# ============================================
RewriteEngine On
RewriteBase /

RewriteRule ^_next/ - [L]
RewriteCond %{REQUEST_URI} ^/api/ [OR]
RewriteCond %{REQUEST_URI} ^/socket.io/
RewriteRule ^ - [L]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{DOCUMENT_ROOT}/$1.html -f
RewriteRule ^(.*)$ $1.html [L]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

Options -Indexes
`.trim();

        fs.writeFileSync("temp_htaccess", htaccessContent);
        await client.uploadFrom("temp_htaccess", path.posix.join(remoteRoot, ".htaccess"));
        fs.unlinkSync("temp_htaccess");

        console.log("\n✅ ALL CLEANED AND DEPLOYED FRESH!");
        console.log("Check: http://mrohaung.com");

    } catch (err) {
        console.error("❌ Deployment failed:", err);
    } finally {
        client.close();
    }
}

cleanAndDeploy();
