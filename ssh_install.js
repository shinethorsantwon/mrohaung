const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
    console.log('Client :: ready');
    conn.exec('cd public_html && npm install --production', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
            conn.end();
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).on('error', (err) => {
    console.log('Connect Error:', err.message);
}).connect({
    host: '193.203.173.82',
    port: 22,
    username: 'u860480593', // Usually matches FTP user prefix or exact user
    password: 'SBCsmFTP1234!@#$' // Try FTP password
});
