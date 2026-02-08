const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    const config = {
        host: "193.203.173.82",
        user: "u860480593.mrohaung.com",
        password: "SBCsmFTP1234!@#$",
        secure: false
    };

    try {
        console.log("🚀 Starting FINAL CLEAN DEPLOYMENT to Hostinger...");
        await client.access(config);
        console.log("✅ Connected.");

        const remoteRoot = "/public_html";

        // 1. CLEAR CRITICAL FILES FIRST
        console.log("🧹 Removing old entry files and .htaccess...");
        try { await client.remove(path.posix.join(remoteRoot, ".htaccess")); } catch (e) { }
        try { await client.remove(path.posix.join(remoteRoot, "index.js")); } catch (e) { }
        try { await client.remove(path.posix.join(remoteRoot, "package.json")); } catch (e) { }
        try { await client.remove(path.posix.join(remoteRoot, ".env")); } catch (e) { }

        // 2. CREATE A FRESH ROBUST .HTACCESS
        // This version ensures no infinite loops and clean proxying
        const htaccessContent = `
# ============================================
# MROHAUNG PRODUCTION CONFIG
# ============================================
RewriteEngine On
RewriteBase /

# 1. DO NOT PROXY TO LOCALHOST:5000 (Hostinger uses Passenger/App Manager for Node)
# Instead, serve the files and let Hostinger App Manager handle them.
# If you are using 'index.js' at root, Hostinger treats the whole site as a Node app.

# 2. To serve Static Frontend + Backend API together:
# Prevent Apache from handling /api and /socket.io
RewriteRule ^api/(.*)$ - [L]
RewriteRule ^socket.io/(.*)$ - [L]

# 3. Serve Next.js Static Assets
RewriteRule ^_next/ - [L]

# 4. Handle Clean URLs for Pages
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{DOCUMENT_ROOT}/$1.html -f
RewriteRule ^(.*)$ $1.html [L]

# 5. SPA Fallback
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

Options -Indexes
`.trim();

        fs.writeFileSync("temp_htaccess", htaccessContent);
        await client.uploadFrom("temp_htaccess", path.posix.join(remoteRoot, ".htaccess"));
        fs.unlinkSync("temp_htaccess");

        // 3. RE-BUILD BACKEND STRUCTURE
        console.log("📦 Ensuring Backend files are fresh...");
        async function uploadDir(localPath, remotePath) {
            const items = fs.readdirSync(localPath);
            for (const item of items) {
                const localItemPath = path.join(localPath, item);
                const remoteItemPath = path.posix.join(remotePath, item);
                const stats = fs.statSync(localItemPath);
                if (stats.isDirectory()) {
                    if (item === 'node_modules' || item === '.git' || item === '.next') continue;
                    await client.ensureDir(remoteItemPath);
                    await uploadDir(localItemPath, remoteItemPath);
                } else {
                    await client.uploadFrom(localItemPath, remoteItemPath);
                }
            }
        }

        // Upload root level files
        await client.uploadFrom("index.js", path.posix.join(remoteRoot, "index.js"));
        await client.uploadFrom(".env", path.posix.join(remoteRoot, ".env"));

        // Re-upload web/out (Frontend)
        await uploadDir("web/out", remoteRoot);

        // Re-upload backend (API)
        await client.ensureDir(path.posix.join(remoteRoot, "backend"));
        await uploadDir("backend", path.posix.join(remoteRoot, "backend"));

        console.log("\n✅ CLEAN DEPLOYMENT COMPLETE!");
        console.log("Please check mrohaung.com now.");

    } catch (err) {
        console.error("❌ Deployment failed:", err);
    } finally {
        client.close();
    }
}

deploy();
