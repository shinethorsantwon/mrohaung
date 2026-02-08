const ftp = require('basic-ftp');
const fs = require('fs');

async function checkDeployment() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: '193.203.173.82',
            user: 'u860480593.mrohaung.com',
            password: 'SBCsmFTP1234!@#$',
            secure: false
        });

        console.log('=== Checking /public_html structure ===\n');
        const list = await client.list('/public_html');
        list.forEach(f => {
            const type = f.isDirectory ? 'DIR ' : 'FILE';
            console.log(`${type}: ${f.name}`);
        });

        // Check if .next exists
        console.log('\n=== Checking for .next folder ===');
        try {
            const nextList = await client.list('/public_html/.next');
            console.log('.next folder EXISTS with', nextList.length, 'items');

            // Check static/chunks
            try {
                const chunksList = await client.list('/public_html/.next/static/chunks');
                console.log('\nFound', chunksList.filter(f => f.name.endsWith('.js')).length, 'JS files in chunks');

                // Download and check first JS file
                const firstJs = chunksList.find(f => f.name.endsWith('.js') && !f.name.includes('map'));
                if (firstJs) {
                    await client.downloadTo('test_chunk.js', `/public_html/.next/static/chunks/${firstJs.name}`);
                    const content = fs.readFileSync('test_chunk.js', 'utf8');

                    console.log(`\nChecking ${firstJs.name}:`);
                    console.log('  Contains "localhost":', content.includes('localhost'));
                    console.log('  Contains "5000":', content.includes('5000'));
                    console.log('  Contains "api.mrohaung.com":', content.includes('api.mrohaung.com'));

                    fs.unlinkSync('test_chunk.js');
                }
            } catch (e) {
                console.log('Could not check chunks:', e.message);
            }
        } catch (e) {
            console.log('.next folder DOES NOT EXIST');
        }

    } finally {
        client.close();
    }
}

checkDeployment();
