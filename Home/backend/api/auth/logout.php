<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../includes/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Method not allowed', 405);
}

$pdo = get_db_connection();
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (preg_match('/Bearer\s+(\S+)/', $authHeader, $matches)) {
    $stmt = $pdo->prepare('DELETE FROM auth_tokens WHERE token = ?');
    $stmt->execute([$matches[1]]);
}

respond(['message' => 'Logged out']);