const ftp = require("basic-ftp");
const fs = require("fs");

async function touchServerJS() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "193.203.173.82",
            user: "u860480593.mrohaung.com",
            password: "SBCsmFTP1234!@#$",
            secure: false
        });

        console.log("Touching /public_html/server.js to force restart...");

        // Download server.js
        await client.downloadTo("temp_server_touch.js", "/public_html/server.js");

        // Append a comment
        const content = fs.readFileSync("temp_server_touch.js", "utf8");
        const newContent = content + `\n// Restart forced at ${new Date().toISOString()}`;
        fs.writeFileSync("temp_server_touch.js", newContent);

        // Upload back
        await client.uploadFrom("temp_server_touch.js", "/public_html/server.js");
        console.log("✅ Successfully touched server.js. Restart should happen now.");

        fs.unlinkSync("temp_server_touch.js");

    } finally {
        client.close();
    }
}

touchServerJS();
