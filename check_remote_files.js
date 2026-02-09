const ftp = require('basic-ftp');

async function checkFiles() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    const config = {
        host: "193.203.173.82",
        user: "u860480593.mrohaung.com",
        password: "SBCsmFTP1234!@#$",
        secure: false
    };

    try {
        await client.access(config);
        console.log("Connect success.");

        const pathsToCheck = [
            "/public_html/index.html",
            "/public_html/_next/static/chunks/6260c4daea7059b2.css",
            "/public_html/_next/static/chunks/014594c5c7391d95.js"
        ];

        for (const p of pathsToCheck) {
            try {
                const size = await client.size(p);
                console.log(`✅ File ${p} exists, size: ${size} bytes`);
            } catch (e) {
                console.log(`❌ File ${p} DOES NOT exist or error: ${e.message}`);
            }
        }

    } catch (err) {
        console.error("Check failed:", err);
    } finally {
        client.close();
    }
}

checkFiles();
