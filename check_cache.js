const https = require('https');

function check(url, label) {
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            if (data.includes('turbopack-45cbec')) {
                console.log(`${label}: SERVING OLD HTML (Cached)`);
            } else if (data.includes('turbopack-07083a')) {
                console.log(`${label}: SERVING NEW HTML (Correct)`);
            } else {
                console.log(`${label}: Unknown content (Build ID mismatch?)`);
                // Check build ID if present
                const match = data.match(/build-(\d+)/);
                if (match) console.log(`  Build ID found: ${match[0]}`);
            }
        });
    }).on('error', (err) => console.log(`${label} Error:`, err.message));
}

check('https://mrohaung.com/', 'Homepage (Standard)');
check(`https://mrohaung.com/?bust=${Date.now()}`, 'Homepage (Busted)');
