const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkUsers() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '153.92.15.35',
            user: process.env.DB_USER || 'u860480593_social_media',
            password: process.env.DB_PASSWORD || process.env.DB_PASS || 'SBCsmdb1234',
            database: process.env.DB_NAME || 'u860480593_social_media',
            port: process.env.DB_PORT || 3306
        });

        const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM User');
        console.log(`Total Users: ${countResult[0].total}`);

        const [rows] = await connection.execute('SELECT email, username, displayName FROM User LIMIT 50');
        console.log('--- Registered Users (Last 10) ---');
        rows.forEach(user => {
            console.log(`Email: ${user.email} | Username: ${user.username} | Display Name: ${user.displayName}`);
        });

        await connection.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkUsers();
