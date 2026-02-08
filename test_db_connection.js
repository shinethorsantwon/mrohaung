const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the root .env
dotenv.config({ path: path.join(__dirname, '.env') });

async function testConnection() {
    console.log('--- Database Connection Test ---');
    console.log(`Host: ${process.env.DB_HOST || '153.92.15.35'}`);
    console.log(`User: ${process.env.DB_USER || 'u860480593_social_media'}`);
    console.log(`Database: ${process.env.DB_NAME || 'u860480593_social_media'}`);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '153.92.15.35',
            user: process.env.DB_USER || 'u860480593_social_media',
            password: process.env.DB_PASSWORD || process.env.DB_PASS || 'SBCsmdb1234',
            database: process.env.DB_NAME || 'u860480593_social_media',
            port: process.env.DB_PORT || 3306,
            connectTimeout: 10000 // 10 seconds timeout
        });

        console.log('\n✅ SUCCESS: Successfully connected to the MySQL server!');

        const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
        console.log('✅ QUERY TEST: "SELECT 1 + 1" returned:', rows[0].solution);

        // Check if tables exist
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`\nFound ${tables.length} tables:`);
        tables.forEach(row => {
            console.log(` - ${Object.values(row)[0]}`);
        });

        await connection.end();
    } catch (err) {
        console.error('\n❌ ERROR: Could not connect to the database.');
        console.error('Detailed error:', err.message);

        if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
            console.log('\n💡 TROUBLESHOOTING TIP:');
            console.log('This usually means Hostinger is blocking your current IP address.');
            console.log('Please go to Hostinger Panel -> Databases -> Remote MySQL');
            console.log('And add your IP address to the whitelist.');
        }
    }
}

testConnection();
