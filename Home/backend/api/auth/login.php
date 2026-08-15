<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../includes/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Method not allowed', 405);
}

$pdo = get_db_connection();
$data = body();

$email = trim(strtolower($data['email'] ?? ''));
$password = $data['password'] ?? '';

if ($email === '' || $password === '') {
    fail('Email and password are required.');
}

// Note: deleted_at IS NULL means a soft-deleted account cannot log in.
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    fail('Invalid email or password.', 401);
}

$token = generate_token();
$stmt = $pdo->prepare(
    'INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))'
);
$stmt->execute([$user['id'], $token]);

respond(['token' => $token, 'user' => public_user($user)]);