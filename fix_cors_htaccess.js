const ftp = require("basic-ftp");
const fs = require("fs");

async function updateBackendHtaccess() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "193.203.173.82",
            user: "u860480593.mrohaung.com",
            password: "SBCsmFTP1234!@#$",
            secure: false
        });

        console.log("Checking api folder...");

        try {
            await client.cd("/public_html/api");

            // Create local .htaccess file with the new content
            const htaccessContent = `<IfModule mod_headers.c>
 Header always set Access-Control-Allow-Origin "https://mrohaung.com"
 Header always set Access-Control-Allow-Credentials "true"
 Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
 Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"

 # Preflight (OPTIONS) requests
 RewriteEngine On
 RewriteCond %{REQUEST_METHOD} OPTIONS
 RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
`;
            fs.writeFileSync("api_htaccess", htaccessContent);

            console.log("Uploading .htaccess to /public_html/api...");
            await client.uploadFrom("api_htaccess", ".htaccess");
            console.log("✅ Successfully updated Backend .htaccess for CORS!");

            // Clean up
            fs.unlinkSync("api_htaccess");

        } catch (e) {
            console.log("❌ Could not access /public_html/api or upload failed: " + e.message);
            // If api folder doesn't exist, maybe it's cleaner to create it?
            // But based on user request, it should be there.
        }

    } finally {
        client.close();
    }
}

updateBackendHtaccess();
