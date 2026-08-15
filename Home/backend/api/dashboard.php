<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../includes/helpers.php';

$pdo = get_db_connection();
require_admin($pdo);

$stats = [
    'total_customers'   => (int) $pdo->query("SELECT COUNT(*) c FROM users WHERE role='customer' AND deleted_at IS NULL")->fetch()['c'],
    'trashed_users'     => (int) $pdo->query("SELECT COUNT(*) c FROM users WHERE deleted_at IS NOT NULL")->fetch()['c'],
    'total_services'    => (int) $pdo->query("SELECT COUNT(*) c FROM services WHERE is_active = 1")->fetch()['c'],
    'total_bookings'    => (int) $pdo->query("SELECT COUNT(*) c FROM bookings")->fetch()['c'],
    'pending_bookings'  => (int) $pdo->query("SELECT COUNT(*) c FROM bookings WHERE status='pending'")->fetch()['c'],
    'revenue_completed' => (float) $pdo->query(
        "SELECT COALESCE(SUM(s.price),0) r FROM bookings b JOIN services s ON s.id=b.service_id WHERE b.status='completed'"
    )->fetch()['r'],
];

$recentBookings = $pdo->query(
    "SELECT b.id, b.booking_date, b.booking_time, b.status, u.name AS customer_name, s.name AS service_name
     FROM bookings b JOIN users u ON u.id=b.user_id JOIN services s ON s.id=b.service_id
     ORDER BY b.created_at DESC LIMIT 8"
)->fetchAll();

respond(['stats' => $stats, 'recent_bookings' => $recentBookings]);