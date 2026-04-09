<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'error' => 'method_not_allowed',
        'message' => 'Use POST only.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function normalize_name(string $value): string
{
    $decoded = html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $decoded = str_replace("\xC2\xA0", ' ', $decoded);
    $trimmed = trim(preg_replace('/\s+/u', ' ', $decoded) ?? '');
    return $trimmed;
}

$rawBody = file_get_contents('php://input');
$input = json_decode($rawBody ?: '', true);
if (!is_array($input)) {
    $input = $_POST;
}

$senderNameOrOrg = trim((string)($input['sender_name_or_org'] ?? ''));
$executiveName = normalize_name((string)($input['executive_name'] ?? ''));
$blessingText = trim((string)($input['blessing_text'] ?? ''));

if ($executiveName === '') {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'error' => 'validation_error',
        'message' => 'executive_name is required.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($blessingText === '') {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'error' => 'validation_error',
        'message' => 'blessing_text is required.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (
    mb_strlen($senderNameOrOrg, 'UTF-8') > 200
    || mb_strlen($executiveName, 'UTF-8') > 200
    || mb_strlen($blessingText, 'UTF-8') > 1000
) {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'error' => 'validation_error',
        'message' => 'Input is too long.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$config = require __DIR__ . '/allowlist.config.php';

$allowedNormalized = array_map('normalize_name', $config['executive_names']);
if (!in_array($executiveName, $allowedNormalized, true)) {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'error' => 'validation_error',
        'message' => 'executive_name is not in allowlist.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!in_array($blessingText, $config['blessing_texts'], true)) {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'error' => 'validation_error',
        'message' => 'blessing_text is not in allowlist.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$storageDir = __DIR__ . '/../storage';
if (!is_dir($storageDir) && !mkdir($storageDir, 0775, true) && !is_dir($storageDir)) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'storage_error',
        'message' => 'Cannot create storage directory.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$dbPath = $storageDir . '/songkran_signatures.db';

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS signature_records (
            sender_name_or_org TEXT NOT NULL,
            executive_name TEXT NOT NULL,
            blessing_text TEXT NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )'
    );

    // Migrate columns added after initial release.
    $columns = $pdo->query('PRAGMA table_info(signature_records)')->fetchAll(PDO::FETCH_ASSOC);
    $existing = array_column($columns, 'name');
    if (!in_array('blessing_text', $existing, true)) {
        $pdo->exec("ALTER TABLE signature_records ADD COLUMN blessing_text TEXT NOT NULL DEFAULT ''");
    }
    if (!in_array('created_at', $existing, true)) {
        $pdo->exec("ALTER TABLE signature_records ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
    }

    $stmt = $pdo->prepare(
        'INSERT INTO signature_records (sender_name_or_org, executive_name, blessing_text)
         VALUES (:sender_name_or_org, :executive_name, :blessing_text)'
    );

    $stmt->execute([
        ':sender_name_or_org' => $senderNameOrOrg,
        ':executive_name' => $executiveName,
        ':blessing_text' => $blessingText,
    ]);

    $createdAt = $pdo->query("SELECT created_at FROM signature_records WHERE rowid = last_insert_rowid()")
        ->fetchColumn();

    echo json_encode([
        'ok' => true,
        'message' => 'Signature saved.',
        'data' => [
            'sender_name_or_org' => $senderNameOrOrg,
            'executive_name' => $executiveName,
            'blessing_text' => $blessingText,
            'created_at' => $createdAt,
        ],
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'db_error',
        'message' => 'Failed to save signature.',
    ], JSON_UNESCAPED_UNICODE);
}
