/**
 * MROHAUNG Maintenance & Cleanup Script
 * 
 * Functions:
 * 1. Cleans orphaned files in public_html/uploads (if present)
 * 2. Cleans orphaned entries in images.db (SQLite)
 * 3. Clears temporary build files from web/out
 */

require('dotenv').config({ path: './backend/.env' });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const Database = require('better-sqlite3');

async function cleanup() {
    console.log('🚀 Starting MROHAUNG System Maintenance Cleanup...');

    let pool;
    try {
        // 1. Connect to MySQL
        pool = mysql.createPool(process.env.DATABASE_URL);
        console.log('✅ Connected to MySQL Database');

        // 2. Collect all referenced media from MySQL
        console.log('🔍 Scanning database for media references...');

        const [users] = await pool.query('SELECT avatarUrl, coverUrl FROM User');
        const [posts] = await pool.query('SELECT imageUrl FROM Post');
        const [stories] = await pool.query('SELECT mediaUrl FROM Story');

        const referencedFiles = new Set();

        const addUrl = (url) => {
            if (!url) return;
            // Extract filename from URL (e.g., http://.../api/image/filename.jpg -> filename.jpg)
            const parts = url.split('/');
            const filename = parts[parts.length - 1];
            if (filename) referencedFiles.add(filename);
        };

        users.forEach(u => { addUrl(u.avatarUrl); addUrl(u.coverUrl); });
        posts.forEach(p => addUrl(p.imageUrl));
        stories.forEach(s => addUrl(s.mediaUrl));

        console.log(`📊 Found ${referencedFiles.size} unique media references in MySQL`);

        // 3. Cleanup public_html/uploads (legacy files)
        const uploadsPath = path.join(__dirname, 'backend/public_html/uploads');
        if (fs.existsSync(uploadsPath)) {
            console.log(`📁 Scanning physical uploads folder: ${uploadsPath}`);
            const files = fs.readdirSync(uploadsPath);
            let deletedCount = 0;

            files.forEach(file => {
                if (!referencedFiles.has(file)) {
                    try {
                        fs.unlinkSync(path.join(uploadsPath, file));
                        deletedCount++;
                    } catch (e) {
                        console.error(`❌ Failed to delete ${file}:`, e.message);
                    }
                }
            });
            console.log(`✅ Cleaned physical uploads: ${deletedCount} orphaned files removed.`);
        } else {
            console.log('ℹ️ No physical uploads folder found at backend/public_html/uploads (Skipping)');
        }

        // 4. Cleanup images.db (SQLite BLOBs)
        const dbPath = path.join(__dirname, 'backend/images.db');
        if (fs.existsSync(dbPath)) {
            console.log(`💾 Scanning SQLite Image Database: ${dbPath}`);
            const db = new Database(dbPath);

            // Clean public images
            const publicImages = db.prepare('SELECT id FROM images').all();
            let publicDeleted = 0;
            const deletePublic = db.prepare('DELETE FROM images WHERE id = ?');

            publicImages.forEach(img => {
                if (!referencedFiles.has(img.id)) {
                    deletePublic.run(img.id);
                    publicDeleted++;
                }
            });

            // Clean private images (Note: we should probably be more careful here, 
            // but for now we follow the same logic of 'referenced in DB')
            // Actually private images might not be in 'posts/users' in a direct 'url' way yet.
            // For now let's just clean public ones as requested.

            console.log(`✅ Cleaned SQLite images.db: ${publicDeleted} orphaned BLOBs removed.`);
            db.close();
        } else {
            console.log('ℹ️ images.db not found (Skipping)');
        }

        // 5. Clear web/out (Build Directory)
        const outPath = path.join(__dirname, 'web/out');
        if (fs.existsSync(outPath)) {
            console.log(`🧹 Clearing Next.js build output: ${outPath}`);
            try {
                fs.rmSync(outPath, { recursive: true, force: true });
                fs.mkdirSync(outPath); // Recreate empty dir
                console.log('✅ web/out directory cleared.');
            } catch (e) {
                console.error('❌ Failed to clear web/out:', e.message);
            }
        } else {
            console.log('ℹ️ web/out directory not found (Skipping)');
        }

    } catch (error) {
        console.error('💥 Maintenance Error:', error);
    } finally {
        if (pool) await pool.end();
        console.log('🏁 Maintenance completed.');
    }
}

cleanup();
