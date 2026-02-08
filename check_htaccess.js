const ftp = require("basic-ftp");
const fs = require("fs");

async function checkFiles() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "193.203.173.82",
            user: "u860480593.mrohaung.com",
            password: "SBCsmFTP1234!@#$",
            secure: false
        });

        console.log("Checking .htaccess and index.html...");

        try {
            await client.downloadTo("remote_htaccess", "/public_html/.htaccess");
            console.log("DOWNLOADED .htaccess");
            console.log(fs.readFileSync("remote_htaccess", "utf8"));
        } catch (e) {
            console.log("No .htaccess found");
        }

        const list = await client.list("/public_html");
        const index = list.find(f => f.name === "index.html");
        if (index) {
            console.log("FOUND index.html");
        } else {
            console.log("NO index.html found");
        }

    } finally {
        client.close();
    }
}

checkFiles();
