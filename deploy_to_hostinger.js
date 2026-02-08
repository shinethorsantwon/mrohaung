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

    try {
        console.log("🚀 Starting Deployment to Hostinger...");
        await client.access(config);
        console.log("✅ Connected to FTP server.");

        // target directory on Hostinger
        const remotePath = "/public_html";

        console.log(`📂 Uploading deployment package to ${remotePath}...`);
        await client.uploadFrom("deploy_package.zip", path.posix.join(remotePath, "deploy_package.zip"));

        console.log("✅ Upload complete!");

        // Upload a small PHP script to unzip the package on the server
        const unzipScript = `<?php
        $zip = new ZipArchive;
        if ($zip->open('deploy_package.zip') === TRUE) {
            $zip->extractTo('.');
            $zip->close();
            echo '✅ Unzip successful!';
            unlink('deploy_package.zip'); // Clean up zip
            unlink('unzip.php');          // Clean up script
        } else {
            echo '❌ Unzip failed!';
        }
        ?>`;

        const tempUnzipFile = "unzip_temp.php";
        fs.writeFileSync(tempUnzipFile, unzipScript);

        console.log("📂 Uploading unzip script...");
        await client.uploadFrom(tempUnzipFile, path.posix.join(remotePath, "unzip.php"));
        fs.unlinkSync(tempUnzipFile);

        console.log("\n--- DEPLOYMENT STEP 1 COMPLETE ---");
        console.log("Next steps:");
        console.log("1. Open your browser and go to: http://mrohaung.com/unzip.php");
        console.log("2. That will extract all files into /public_html.");
        console.log("3. The site will be live!");

    } catch (err) {
        console.error("❌ Deployment failed:", err);
    } finally {
        client.close();
    }
}

deploy();
