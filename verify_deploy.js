const ftp = require('basic-ftp');
const fs = require('fs');

async function checkServer() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: '193.203.173.82',
            user: 'u860480593.mrohaung.com',
            password: 'SBCsmFTP1234!@#$',
            secure: false
        });

        const list = await client.list('/public_html/.next/static/chunks');
        const jsFiles = list.filter(f => f.name.endsWith('.js') && !f.name.includes('map')).slice(0, 5);

        console.log('Checking files for localhost references...\n');

        for (const file of jsFiles) {
            try {
                await client.downloadTo(`temp_${file.name}`, `/public_html/.next/static/chunks/${file.name}`);
                const content = fs.readFileSync(`temp_${file.name}`, 'utf8');
                const hasLocalhost = content.includes('localhost');
                const has5000 = content.includes('5000');

                console.log(`${file.name}:`);
                console.log(`  - Contains 'localhost': ${hasLocalhost}`);
                console.log(`  - Contains '5000': ${has5000}`);

                if (hasLocalhost || has5000) {
                    console.log('  ⚠️  WARNING: This file has localhost references!');
                }
                console.log('');

                fs.unlinkSync(`temp_${file.name}`);
            } catch (e) {
                console.log(`  Error checking ${file.name}: ${e.message}`);
            }
        }

    } finally {
        client.close();
    }
}

checkServer();
