const https = require('https');

https.get('https://mrohaung.com/check_npm.php', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Response:', data));
}).on('error', (err) => console.log('Error:', err.message));
