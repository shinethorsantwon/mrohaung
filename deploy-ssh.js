const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// SSH Configuration
const SSH_HOST = '193.203.173.82';
const SSH_PORT = '65002';
const SSH_USER = 'u860480593';
const REMOTE_PATH = '/home/u860480593/public_html/api';

// Helper to run shell commands
function runCommand(command, cwd = __dirname, env = {}) {
    return new Promise((resolve, reject) => {
        console.log(`Running: ${command}`);
        exec(command, { cwd, env: { ...process.env, ...env }, shell: 'powershell.exe' }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return reject(error);
            }
            if (stderr && !stderr.includes('Warning')) console.error(`Stderr: ${stderr}`);
            if (stdout) console.log(`Stdout: ${stdout}`);
            resolve(stdout);
        });
    });
}

async function deploy() {
    try {
        console.log("Starting SSH Deployment Process...\n");

        // 1. Build Frontend
        console.log("--- Building Frontend ---");
        await runCommand("npm install", path.join(__dirname, "web"));
        await runCommand("npm run build", path.join(__dirname, "web"), {
            NEXT_PUBLIC_API_URL: "https://api.mrohaung.com/api"
        });

        // 2. Zip and upload Frontend
        console.log("\n--- Uploading Frontend ---");
        const frontendZip = path.join(__dirname, "frontend.zip");
        if (fs.existsSync(frontendZip)) fs.unlinkSync(frontendZip);

        await runCommand(
            `Compress-Archive -Path '${path.join(__dirname, "web/out")}\\*' -DestinationPath '${frontendZip}' -Force`
        );

        await runCommand(
            `scp -P ${SSH_PORT} "${frontendZip}" ${SSH_USER}@${SSH_HOST}:/home/${SSH_USER}/frontend.zip`
        );

        // 3. Zip and upload Backend
        console.log("\n--- Uploading Backend ---");
        const backendZip = path.join(__dirname, "backend.zip");
        if (fs.existsSync(backendZip)) fs.unlinkSync(backendZip);

        await runCommand(
            `Compress-Archive -Path '${path.join(__dirname, "backend")}\\*' -DestinationPath '${backendZip}' -Force`
        );

        await runCommand(
            `scp -P ${SSH_PORT} "${backendZip}" ${SSH_USER}@${SSH_HOST}:/home/${SSH_USER}/backend.zip`
        );

        // 4. Extract and setup on server
        console.log("\n--- Setting up on Server ---");
        const sshCommands = [
            // Extract frontend
            `cd /home/${SSH_USER}/public_html`,
            `unzip -o /home/${SSH_USER}/frontend.zip`,
            `rm /home/${SSH_USER}/frontend.zip`,

            // Extract backend
            `cd ${REMOTE_PATH}`,
            `unzip -o /home/${SSH_USER}/backend.zip`,
            `rm /home/${SSH_USER}/backend.zip`,

            // Install and start
            `npm install --production`,
            `npx prisma generate`,
            `pm2 delete social-api || true`,
            `pm2 start index.js --name social-api`,
            `pm2 save`,
            `pm2 list`
        ].join(' && ');

        await runCommand(
            `ssh -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST} "${sshCommands}"`
        );

        // Cleanup local zips
        if (fs.existsSync(frontendZip)) fs.unlinkSync(frontendZip);
        if (fs.existsSync(backendZip)) fs.unlinkSync(backendZip);

        console.log("\n---------------------------------------------------");
        console.log("Deployment Complete!");
        console.log("Frontend: https://mrohaung.com");
        console.log("Backend API: https://api.mrohaung.com/api");
        console.log("---------------------------------------------------");

    } catch (err) {
        console.error("Deployment Failed:", err);
    }
}

deploy();
