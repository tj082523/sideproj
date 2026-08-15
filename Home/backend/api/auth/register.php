<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../includes/helpers.php';

$pdo = get_db_connection();
$user = require_auth($pdo);

respond(['user' => public_user($user)]);