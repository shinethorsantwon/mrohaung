const ftp = require("basic-ftp");
const fs = require("fs");

async function checkRestartFile() {
    const client = new ftp.Client();
    // client.ftp.verbose = true;
    try {
        await client.access({
            host: "193.203.173.82",
            user: "u860480593.mrohaung.com",
            password: "SBCsmFTP1234!@#$",
            secure: false
        });

        console.log("Checking tmp/restart.txt...");

        try {
            await client.cd("/public_html/tmp");
            const list = await client.list();
            const restartFile = list.find(f => f.name === "restart.txt");

            if (restartFile) {
                console.log(`✅ Found tmp/restart.txt (Size: ${restartFile.size}, Time: ${restartFile.modifiedAt})`);
                console.log("Trigger successfully armed.");
            } else {
                console.log("❌ Restart file NOT found.");
            }
        } catch (e) {
            console.log("❌ Could not access /public_html/tmp");
        }

    } finally {
        client.close();
    }
}

checkRestartFile();
