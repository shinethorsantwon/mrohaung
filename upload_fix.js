const ftp = require('basic-ftp');
const path = require('path');

async function uploadFix() {
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
        await client.uploadFrom("fix_permissions.php", "/public_html/fix_permissions.php");
        console.log("Upload success.");
    } catch (err) {
        console.error("Upload failed:", err);
    } finally {
        client.close();
    }
}

uploadFix();
