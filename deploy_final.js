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

            // Skip unnecessary folders
            if (item === 'node_modules' || item === '.git' || item === '.next' || item === 'deploy_temp' || item == 'deploy_package.zip' || item == 'build_output.txt') {
                continue;
            }

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
        console.log("🚀 Starting DIRECT FOLDER DEPLOYMENT (No Zip) to Hostinger...");
        await client.access(config);
        console.log("✅ Connected to FTP.");

        const remoteRoot = "/public_html";

        // 1. Clear old critical files if any (optional, keeping it safe)
        console.log("🧹 Preparing server...");

        // 2. Upload Root Files (index.js, .env, package.json)
        console.log("📝 Uploading root entry files...");
        await client.uploadFrom("index.js", path.posix.join(remoteRoot, "index.js"));
        await client.uploadFrom(".env", path.posix.join(remoteRoot, ".env"));
        await client.uploadFrom("package.json", path.posix.join(remoteRoot, "package.json"));

        // 3. Upload Frontend Static Files (from web/out to root)
        console.log("🌐 Uploading Frontend Assets...");
        await uploadDir("web/out", remoteRoot);

        // 4. Upload Backend Folders (to /backend)
        console.log("⚙️  Uploading Backend Services...");
        await client.ensureDir(path.posix.join(remoteRoot, "backend"));
        await uploadDir("backend", path.posix.join(remoteRoot, "backend"));

        // 5. Create a Robust .htaccess (To handle routing)
        console.log("📄 Creating .htaccess...");
        const htaccessContent = `
# Htaccess for Hybrid Next.js (Static) + Node.js (API) on Hostinger
# Optimized for Next.js 15+ Static Export

Options -Indexes
DirectoryIndex index.html

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # 1. FIX: Ensure _next and other static assets are NEVER handled by SPA rules
    RewriteRule ^(_next|static|images|public)/ - [L]

    # 2. Proxy API and Socket.IO requests to Node.js
    <IfModule mod_proxy.c>
        RewriteCond %{REQUEST_URI} ^/api/ [OR]
        RewriteCond %{REQUEST_URI} ^/socket.io/
        RewriteRule ^(.*)$ http://localhost:5000/$1 [P,L]
    </IfModule>

    # 3. Fallback for clean URLs (e.g., /login -> login.html)
    # Check if the requested path corresponds to an existing .html file
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{DOCUMENT_ROOT}/$1.html -f
    RewriteRule ^([^/]+)/?$ $1.html [L]

    # 4. Handle Profile Catch-all (for /profile/username)
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^profile/.*$ profile/index.html [L]

    # 5. SPA Fallback - Everything else to index.html
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} !^/api/
    RewriteRule ^ index.html [L]
</IfModule>

# Handle MIME types correctly
<IfModule mod_mime.c>
    AddType text/css .css
    AddType application/javascript .js
    AddType application/json .json
</IfModule>
`.trim();

        fs.writeFileSync("temp_htaccess", htaccessContent);
        await client.uploadFrom("temp_htaccess", path.posix.join(remoteRoot, ".htaccess"));
        fs.unlinkSync("temp_htaccess");

        console.log("\n✅ DEPLOYMENT SUCCESSFUL!");
        console.log("All files uploaded directly without Zipping. No path issues expected.");
        console.log("Check: http://mrohaung.com");

    } catch (err) {
        console.error("❌ Deployment failed:", err);
    } finally {
        client.close();
    }
}

deploy();
