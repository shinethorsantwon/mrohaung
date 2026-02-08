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

    /**
     * Recursively uploads a directory to the FTP server.
     */
    async function uploadDir(localPath, remotePath) {
        const items = fs.readdirSync(localPath);
        for (const item of items) {
            const localItemPath = path.join(localPath, item);
            const remoteItemPath = path.posix.join(remotePath, item);
            const stats = fs.statSync(localItemPath);

            if (stats.isDirectory()) {
                console.log(`📁 Creating folder: ${remoteItemPath}`);
                await client.ensureDir(remoteItemPath);
                await uploadDir(localItemPath, remoteItemPath);
            } else {
                console.log(`📄 Uploading file: ${remoteItemPath}`);
                await client.uploadFrom(localItemPath, remoteItemPath);
            }
        }
    }

    try {
        console.log("🚀 Starting STATIC FRONTEND DEPLOYMENT to Hostinger...");
        await client.access(config);
        console.log("✅ Connected.");

        const remoteRoot = "/public_html";

        // 1. Upload ONLY the static frontend (from web/out to root)
        console.log("🌐 Uploading Frontend Assets (Connecting to Render Backend)...");
        await uploadDir("web/out", remoteRoot);

        // 2. Upload the correct .htaccess for Static Hosting
        const htaccessContent = `
# ============================================
# MROHAUNG - STATIC FRONTEND CONFIG
# ============================================
RewriteEngine On
RewriteBase /

# 1. Force No-Cache for HTML/JSON (Prevents old file issues)
<IfModule mod_headers.c>
    <FilesMatch "\\.(html|json)$">
        Header set Cache-Control "no-cache, no-store, must-revalidate"
        Header set Pragma "no-cache"
        Header set Expires 0
    </FilesMatch>
</IfModule>

# 2. Serve static assets directly
RewriteRule ^_next/ - [L]
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# 3. Handle Profile Routing Fallback (for dynamic profiles)
RewriteCond %{REQUEST_URI} ^/profile/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^profile/.*$ /profile/user.html [L]

# 4. Handle Post Routing Fallback (/[username]/[postId])
RewriteCond %{REQUEST_URI} ^/([^/]+)/([^/]+)$
RewriteCond %{REQUEST_FILENAME} !-f
# Ensure we don't catch static assets or reserved paths
RewriteCond %{REQUEST_URI} !^/(_next|api|uploads|static)
RewriteRule ^([^/]+)/([^/]+)$ /index.html [L]

# 5. Handle Clean URLs for Pages (e.g., mrohaung.com/login)
RewriteCond %{DOCUMENT_ROOT}/$1.html -f
RewriteRule ^(.*)$ $1.html [L]

# 5. SPA Fallback (Client-side routing)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

Options -Indexes
`.trim();

        fs.writeFileSync("temp_htaccess", htaccessContent);
        await client.uploadFrom("temp_htaccess", path.posix.join(remoteRoot, ".htaccess"));
        fs.unlinkSync("temp_htaccess");

        console.log("\n✅ STATIC DEPLOYMENT COMPLETE!");
        console.log("Frontend: mrohaung.com");
        console.log("Backend: mrohaung.onrender.com");

    } catch (err) {
        console.error("❌ Deployment failed:", err);
    } finally {
        client.close();
    }
}

deploy();
