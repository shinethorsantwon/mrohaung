<?php
/**
 * Permission Fixer for Hostinger
 * This script recursively sets permissions to 755 for folders and 644 for files.
 */

function fixPermissions($path) {
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($path, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($iterator as $item) {
        if ($item->isDir()) {
            chmod($item->getPathname(), 0755);
            echo "📁 Folder: " . $item->getPathname() . " -> 755<br>";
        } else {
            chmod($item->getPathname(), 0644);
            echo "📄 File: " . $item->getPathname() . " -> 644<br>";
        }
    }
}

echo "<h1>🚀 Starting Permission Fix...</h1>";
fixPermissions('.');
echo "<h1>✅ Done!</h1>";
?>
