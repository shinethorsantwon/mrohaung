const ftp = require("basic-ftp");
const fs = require("fs");

async function checkApiFolder() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "193.203.173.82",
            user: "u860480593.mrohaung.com",
            password: "SBCsmFTP1234!@#$",
            secure: false
        });

        console.log("Checking /public_html/api...");
        try {
            await client.cd("/public_html/api");
            const list = await client.list();
            console.log("Files found:");
            list.forEach(f => console.log(` - ${f.name} (${f.size} bytes)`));
        } catch (e) {
            console.log("Error accessing /public_html/api:", e.message);
        }

    } finally {
        client.close();
    }
}

checkApiFolder();
