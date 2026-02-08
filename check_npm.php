<?php
echo "Node Version: ";
echo exec('node -v 2>&1');
echo "\nNPM Version: ";
echo exec('npm -v 2>&1');
echo "\nCurrent Directory: ";
echo getcwd();
?>
