const ftp = require("basic-ftp");

async function forceRestart() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        await client.access({
            host: "193.203.173.82",
            user: "u860480593.mrohaung.com",
            password: "SBCsmFTP1234!@#$",
            secure: false
        });

        console.log("Connect success. Attempting to trigger Passenger restart...");

        // Strategy 1: Create tmp/restart.txt in public_html
        await client.cd("/public_html");
        await client.ensureDir("tmp");

        // Upload a file with current timestamp to force change detection
        const timestamp = new Date().toISOString();
        const buffer = Buffer.from(timestamp);

        console.log("Uploading tmp/restart.txt...");
        await client.uploadFrom(buffer, "tmp/restart.txt");
        console.log("✓ Uploaded tmp/restart.txt");

        console.log("Waiting 5 seconds...");
        await new Promise(r => setTimeout(r, 5000));

        // Strategy 2: Update timestamps on essential files
        console.log("Touching server.js...");
        // downloading and re-uploading server.js updates its modification time
        await client.downloadTo("temp_server.js", "server.js");
        await client.uploadFrom("temp_server.js", "server.js");
        console.log("✓ Touched server.js");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        client.close();
    }
}

forceRestart();
