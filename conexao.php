<?php
$host = 'localhost';
$port = '3306';
$usuario = 'root';
$senha = 'mysql';
$banco = 'jerry_run';

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$banco;charset=utf8mb4",
        $usuario,
        $senha
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    die("Erro na conexão: " . $e->getMessage());
}
?>