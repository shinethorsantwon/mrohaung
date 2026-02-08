const ftp = require("basic-ftp");

async function removeApiHtaccess() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        await client.access({
            host: "193.203.173.82",
            user: "u860480593.mrohaung.com",
            password: "SBCsmFTP1234!@#$",
            secure: false
        });

        console.log("Connected. Removing /public_html/api/.htaccess...");
        try {
            await client.remove("/public_html/api/.htaccess");
            console.log("✅ Successfully removed /public_html/api/.htaccess");
        } catch (e) {
            console.log("⚠️ Could not remove .htaccess (maybe already gone): " + e.message);
        }

    } catch (e) {
        console.error("Error connecting:", e);
    } finally {
        client.close();
    }
}

removeApiHtaccess();
