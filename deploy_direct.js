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
     * This method ensures actual folders are created on the Linux server.
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
        console.log("🚀 Starting DIRECT FOLDER DEPLOYMENT to Hostinger...");
        await client.access(config);
        console.log("✅ Connected.");

        // Clear existing files if necessary or just overlay
        const remoteRoot = "/public_html";

        // 1. Upload Frontend (from web/out to root)
        console.log("🌐 Uploading Frontend Assets...");
        await uploadDir("web/out", remoteRoot);

        // 2. Upload Backend (to /backend folder)
        console.log("⚙️  Uploading Backend Services...");
        await client.ensureDir(path.posix.join(remoteRoot, "backend"));
        await uploadDir("backend", path.posix.join(remoteRoot, "backend"));

        // 3. Upload Root Entry Files
        console.log("📝 Uploading entry files...");
        await client.uploadFrom("index.js", path.posix.join(remoteRoot, "index.js"));
        await client.uploadFrom(".env", path.posix.join(remoteRoot, ".env"));

        // 4. Upload the combined .htaccess
        const htaccessContent = `RewriteEngine On
RewriteBase /
RewriteRule ^api/(.*)$ http://127.0.0.1:5000/api/$1 [P,L]
RewriteRule ^uploads/(.*)$ http://127.0.0.1:5000/uploads/$1 [P,L]
RewriteRule ^socket.io/(.*)$ http://127.0.0.1:5000/socket.io/$1 [P,L]
RewriteRule ^_next/ - [L]
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]
RewriteCond %{DOCUMENT_ROOT}/$1.html -f
RewriteRule ^(.*)$ $1.html [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
Options -Indexes`;

        fs.writeFileSync("temp_htaccess", htaccessContent);
        await client.uploadFrom("temp_htaccess", path.posix.join(remoteRoot, ".htaccess"));
        fs.unlinkSync("temp_htaccess");

        console.log("\n✅ DEPLOYMENT COMPLETE!");
        console.log("The folders have been created correctly and files are in their proper places.");

    } catch (err) {
        console.error("❌ Deployment failed:", err);
    } finally {
        client.close();
    }
}

deploy();
