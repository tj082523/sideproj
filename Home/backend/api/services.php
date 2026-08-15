<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../includes/helpers.php';

$pdo = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;

switch ($method) {
    case 'GET':
        // Public: list active services, or fetch one by id.
        if ($id) {
            $stmt = $pdo->prepare('SELECT * FROM services WHERE id = ?');
            $stmt->execute([$id]);
            $service = $stmt->fetch();
            $service ? respond(['service' => $service]) : fail('Service not found', 404);
        } else {
            // Admins can pass ?all=1 to see inactive services too.
            $user = current_user($pdo);
            $showAll = isset($_GET['all']) && $user && $user['role'] === 'admin';
            $sql = $showAll ? 'SELECT * FROM services ORDER BY id DESC'
                             : 'SELECT * FROM services WHERE is_active = 1 ORDER BY id DESC';
            $services = $pdo->query($sql)->fetchAll();
            respond(['services' => $services]);
        }
        break;

    case 'POST':
        require_admin($pdo);
        $data = body();
        $name = trim($data['name'] ?? '');
        if ($name === '') fail('Service name is required.');

        $stmt = $pdo->prepare(
            'INSERT INTO services (name, description, category, price, duration_minutes, image_url, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $name,
            $data['description'] ?? null,
            $data['category'] ?? null,
            $data['price'] ?? 0,
            $data['duration_minutes'] ?? 60,
            $data['image_url'] ?? null,
            isset($data['is_active']) ? (int) (bool) $data['is_active'] : 1,
        ]);
        respond(['id' => (int) $pdo->lastInsertId()], 201);
        break;

    case 'PUT':
        require_admin($pdo);
        if (!$id) fail('Service id is required.');
        $data = body();

        $stmt = $pdo->prepare(
            'UPDATE services SET name=?, description=?, category=?, price=?, duration_minutes=?, image_url=?, is_active=?
             WHERE id = ?'
        );
        $stmt->execute([
            $data['name'] ?? '',
            $data['description'] ?? null,
            $data['category'] ?? null,
            $data['price'] ?? 0,
            $data['duration_minutes'] ?? 60,
            $data['image_url'] ?? null,
            isset($data['is_active']) ? (int) (bool) $data['is_active'] : 1,
            $id,
        ]);
        respond(['message' => 'Service updated']);
        break;

    case 'DELETE':
        require_admin($pdo);
        if (!$id) fail('Service id is required.');
        $stmt = $pdo->prepare('DELETE FROM services WHERE id = ?');
        $stmt->execute([$id]);
        respond(['message' => 'Service deleted']);
        break;

    default:
        fail('Method not allowed', 405);
}