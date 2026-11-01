<?php
require_once __DIR__ . '/includes/db.php';

try {
    $host = defined('DB_HOST') ? DB_HOST : '127.0.0.1';
    $user = defined('DB_USER') ? DB_USER : 'root';
    $pass = defined('DB_PASS') ? DB_PASS : '';
    $dbName = defined('DB_NAME') ? DB_NAME : 'rosetta_for_all';

    $pdo = new PDO("mysql:host={$host}", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "Database `{$dbName}` created or already exists.\n";
    
    // Select database
    $pdo->exec("USE `{$dbName}`");
    
    // Load schema
    $schemaFile = __DIR__ . '/schema.sql';
    if (file_exists($schemaFile)) {
        $schema = file_get_contents($schemaFile);
        $pdo->exec($schema);
        echo "MySQL schema imported successfully.\n";
    } else {
        echo "Could not find schema.sql\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
