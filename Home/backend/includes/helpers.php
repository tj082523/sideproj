<?php
require_once __DIR__ . '/../config/database.php';

/** Send a JSON response and stop execution. */
function respond($data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function fail(string $message, int $status = 400): void {
    respond(['error' => $message], $status);
}

/** Parse JSON request body into an assoc array. */
function body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/** Generate a secure random bearer token. */
function generate_token(): string {
    return bin2hex(random_bytes(32));
}

/**
 * Resolve the currently authenticated user from the Authorization header.
 * Returns the user row (assoc array) or null if not authenticated.
 */
function current_user(PDO $pdo): ?array {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!preg_match('/Bearer\s+(\S+)/', $authHeader, $matches)) {
        return null;
    }
    $token = $matches[1];

    $stmt = $pdo->prepare(
        'SELECT u.* FROM auth_tokens t
         JOIN users u ON u.id = t.user_id
         WHERE t.token = ? AND t.expires_at > NOW() AND u.deleted_at IS NULL'
    );
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    return $user ?: null;
}

/** Require any authenticated user; halts with 401 if not logged in. */
function require_auth(PDO $pdo): array {
    $user = current_user($pdo);
    if (!$user) {
        fail('Not authenticated', 401);
    }
    return $user;
}

/** Require an authenticated admin; halts with 403 if not an admin. */
function require_admin(PDO $pdo): array {
    $user = require_auth($pdo);
    if ($user['role'] !== 'admin') {
        fail('Admin access required', 403);
    }
    return $user;
}

/** Strip sensitive fields before returning a user to the client. */
function public_user(array $user): array {
    unset($user['password_hash']);
    return $user;
}