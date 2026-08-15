<?php
/**
 * Admin-only user management.
 *
 * Key behavior: deleting a user never removes the row immediately.
 * It sets `deleted_at`, which hides the account everywhere (login,
 * public listings, etc). The admin dashboard has a "Trash" view
 * listing these soft-deleted accounts with a one-click Restore
 * button, so an accidental delete is always reversible. A separate,
 * explicit "permanent delete" action is required to actually erase
 * the row — that one cannot be undone.
 *
 * Routes:
 *   GET    /users.php              -> active users
 *   GET    /users.php?trash=1      -> soft-deleted users
 *   POST   /users.php?id=5&action=restore  -> undo delete
 *   DELETE /users.php?id=5                 -> soft delete
 *   DELETE /users.php?id=5&permanent=1     -> hard delete (irreversible)
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../includes/helpers.php';

$pdo = get_db_connection();
$admin = require_admin($pdo);
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;

function log_action(PDO $pdo, int $adminId, string $action, int $targetUserId): void {
    $stmt = $pdo->prepare(
        'INSERT INTO admin_action_log (admin_id, action, target_user_id) VALUES (?, ?, ?)'
    );
    $stmt->execute([$adminId, $action, $targetUserId]);
}

switch ($method) {
    case 'GET':
        if (isset($_GET['trash'])) {
            $users = $pdo->query(
                'SELECT * FROM users WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC'
            )->fetchAll();
        } else {
            $users = $pdo->query(
                'SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC'
            )->fetchAll();
        }
        respond(['users' => array_map('public_user', $users)]);
        break;

    case 'POST':
        // Restore a soft-deleted user.
        if (!$id) fail('User id is required.');
        $action = $_GET['action'] ?? '';
        if ($action !== 'restore') fail('Unknown action.');

        if ($id === (int) $admin['id']) fail('You cannot restore your own account this way.');

        $stmt = $pdo->prepare('UPDATE users SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) fail('User not found in trash.', 404);

        log_action($pdo, (int) $admin['id'], 'restore_user', $id);
        respond(['message' => 'User restored']);
        break;

    case 'DELETE':
        if (!$id) fail('User id is required.');
        if ($id === (int) $admin['id']) fail('You cannot delete your own account.');

        $permanent = isset($_GET['permanent']) && $_GET['permanent'] === '1';

        if ($permanent) {
            // Irreversible — only allowed on an account that is already in the trash,
            // as an extra guard rail against accidental permanent deletion.
            $stmt = $pdo->prepare('SELECT deleted_at FROM users WHERE id = ?');
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) fail('User not found.', 404);
            if ($row['deleted_at'] === null) fail('Move the user to trash before permanently deleting.');

            $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
            $stmt->execute([$id]);
            log_action($pdo, (int) $admin['id'], 'permanent_delete_user', $id);
            respond(['message' => 'User permanently deleted']);
        } else {
            $stmt = $pdo->prepare('UPDATE users SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL');
            $stmt->execute([$id]);
            if ($stmt->rowCount() === 0) fail('User not found or already deleted.', 404);

            log_action($pdo, (int) $admin['id'], 'delete_user', $id);
            respond(['message' => 'User moved to trash. It can be restored anytime.']);
        }
        break;

    default:
        fail('Method not allowed', 405);
}
