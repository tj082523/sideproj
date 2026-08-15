<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../includes/helpers.php';

$pdo = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;

switch ($method) {
    case 'GET':
        $user = require_auth($pdo);
        if ($user['role'] === 'admin') {
            // Admin sees every booking, with customer + service details joined in.
            $sql = 'SELECT b.*, u.name AS customer_name, u.email AS customer_email,
                           s.name AS service_name, s.price AS service_price
                    FROM bookings b
                    JOIN users u ON u.id = b.user_id
                    JOIN services s ON s.id = b.service_id
                    ORDER BY b.booking_date DESC, b.booking_time DESC';
            $bookings = $pdo->query($sql)->fetchAll();
        } else {
            $stmt = $pdo->prepare(
                'SELECT b.*, s.name AS service_name, s.price AS service_price
                 FROM bookings b JOIN services s ON s.id = b.service_id
                 WHERE b.user_id = ? ORDER BY b.booking_date DESC, b.booking_time DESC'
            );
            $stmt->execute([$user['id']]);
            $bookings = $stmt->fetchAll();
        }
        respond(['bookings' => $bookings]);
        break;

    case 'POST':
        $user = require_auth($pdo);
        $data = body();
        $serviceId = (int) ($data['service_id'] ?? 0);
        $date = $data['booking_date'] ?? '';
        $time = $data['booking_time'] ?? '';

        if (!$serviceId || !$date || !$time) {
            fail('service_id, booking_date, and booking_time are required.');
        }

        $stmt = $pdo->prepare('SELECT id FROM services WHERE id = ? AND is_active = 1');
        $stmt->execute([$serviceId]);
        if (!$stmt->fetch()) fail('Selected service is not available.', 404);

        $stmt = $pdo->prepare(
            'INSERT INTO bookings (user_id, service_id, booking_date, booking_time, notes, status)
             VALUES (?, ?, ?, ?, ?, "pending")'
        );
        $stmt->execute([$user['id'], $serviceId, $date, $time, $data['notes'] ?? null]);
        respond(['id' => (int) $pdo->lastInsertId(), 'message' => 'Booking created'], 201);
        break;

    case 'PUT':
        $user = require_auth($pdo);
        if (!$id) fail('Booking id is required.');
        $data = body();

        // Customers may only cancel their own booking; admins may change status freely.
        $stmt = $pdo->prepare('SELECT * FROM bookings WHERE id = ?');
        $stmt->execute([$id]);
        $booking = $stmt->fetch();
        if (!$booking) fail('Booking not found', 404);

        $newStatus = $data['status'] ?? $booking['status'];
        if ($user['role'] !== 'admin') {
            if ($booking['user_id'] !== $user['id']) fail('Forbidden', 403);
            if ($newStatus !== 'cancelled') fail('Customers can only cancel a booking.', 403);
        }

        $stmt = $pdo->prepare('UPDATE bookings SET status = ?, notes = COALESCE(?, notes) WHERE id = ?');
        $stmt->execute([$newStatus, $data['notes'] ?? null, $id]);
        respond(['message' => 'Booking updated']);
        break;

    case 'DELETE':
        $user = require_admin($pdo);
        if (!$id) fail('Booking id is required.');
        $stmt = $pdo->prepare('DELETE FROM bookings WHERE id = ?');
        $stmt->execute([$id]);
        respond(['message' => 'Booking deleted']);
        break;

    default:
        fail('Method not allowed', 405);
}