<?php
/**
 * CORS headers — allows the React dev server (and your deployed
 * frontend origin) to call this API from the browser.
 */

$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    getenv('FRONTEND_ORIGIN') ?: '',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}