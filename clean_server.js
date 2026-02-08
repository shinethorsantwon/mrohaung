const ftp = require("basic-ftp");
require("dotenv").config();

async function cleanServer() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        await client.access({
            host: "193.203.173.82",
            user: "u860480593.mrohaung.com",
            password: "SBCsmFTP1234!@#$",
            secure: false
        });

        await client.cd("/public_html");

        console.log("🗑️  FORCE REMOVING ALL DEPLOYMENT FILES...\n");

        // Recursively delete .next folder
        async function forceRemoveDir(dirPath) {
            try {
                const list = await client.list(dirPath);

                for (const item of list) {
                    const fullPath = `${dirPath}/${item.name}`;

                    if (item.isDirectory) {
                        await forceRemoveDir(fullPath);
                        await client.removeDir(fullPath);
                        console.log(`  ✓ Removed dir: ${fullPath}`);
                    } else {
                        await client.remove(fullPath);
                        console.log(`  ✓ Removed file: ${fullPath}`);
                    }
                }
            } catch (e) {
                console.log(`  Error in ${dirPath}: ${e.message}`);
            }
        }

        // Force remove .next
        await forceRemoveDir('.next');
        await client.removeDir('.next');

        // Remove other files
        const files = ['server.js', 'package.json', '.env.production'];
        for (const file of files) {
            try {
                await client.remove(file);
                console.log(`  ✓ Removed: ${file}`);
            } catch (e) {
                console.log(`  Note: ${file} not found`);
            }
        }

        // Remove public directory
        try {
            await forceRemoveDir('public');
            await client.removeDir('public');
        } catch (e) {
            console.log('  Note: public folder not found');
        }

        console.log("\n✅ Server cleaned successfully!");

    } finally {
        client.close();
    }
}

cleanServer();
