const FtpDeploy = require("ftp-deploy");
const ftpDeploy = new FtpDeploy();
require("dotenv").config();

const config = {
    user: "u860480593.mrohaung.com",
    password: "SBCsmFTP1234!@#$",
    host: "193.203.173.82",
    port: 21,
    localRoot: __dirname + "/web/out", // Deploying the static 'out' folder for Hostinger Shared
    remoteRoot: "/public_html",
    include: ["*", "**/*"],
    exclude: [
        "node_modules/**",
        ".next/**",
        ".git/**",
        ".env",
        ".vscode/**",
        ".DS_Store",
        "deploy.js"
    ],
    deleteRemote: true, // Clean the remote folder before upload to prevent version conflicts
    forcePasv: true,
    sftp: false,
};

console.log("🚀 Starting deployment to Hostinger...");
console.log(`Target: ${config.host}:${config.remoteRoot}`);

ftpDeploy
    .deploy(config)
    .then((res) => console.log("✅ Deployment successful! Finished uploading all files."))
    .catch((err) => {
        console.error("❌ Deployment failed:");
        console.error(err);
    });

ftpDeploy.on("uploading", function (data) {
    console.log(`Uploading (${data.transferredFileCount}/${data.totalFilesCount}): ${data.filename}`);
});

ftpDeploy.on("uploaded", function (data) {
    console.log(`Finished: ${data.filename}`);
});

ftpDeploy.on("log", function (data) {
    console.log(data);
});

ftpDeploy.on("upload-error", function (data) {
    console.error(`Error uploading ${data.filename}:`, data.err);
});
