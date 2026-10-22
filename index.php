
<?php
require_once 'conexao.php';

try {
    $stmt = $pdo->prepare("
        SELECT id, nome, pontos,
        DATE_FORMAT(data_registro, '%d/%m/%Y %H:%i') AS data
        FROM ranking
        ORDER BY pontos DESC, id ASC
        LIMIT 10
    ");

    $stmt->execute();
    $ranking = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $ranking = [];
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jerry's Coin Run</title>
    <link rel="stylesheet" href="css/styles.css">
    <script src="js/script.js" defer></script>
</head>
<body>

    <main class="game-container">

        <h1>Jerry's Coin Run</h1>
        <p>Ajude o Jerry a correr e desviar dos obstáculos!</p>

        <div class="hud-bar">
            <span>Jogador: <strong id="player-name">Visitante</strong></span>
            <span>Pontuação: <strong id="score">0</strong></span>
        </div>

        <div class="game-board" id="game-board">

            <img src="assets/clouds.png" class="clouds" alt="Nuvens">

            <img
                src="assets/jerry_sem_fundo.gif"
                class="mario"
                alt="Jerry correndo"
            >

            <img src="assets/pipe.png" class="pipe" alt="Obstáculo">

            <img
                src="assets/queijo.png"
                class="cheese"
                alt="Queijo que vale 10 pontos"
            >

            <p class="jump-tip">
                Pressione ESPAÇO ou ↑ para pular!
            </p>

        </div>

    </main>

    <div class="modal" id="start-modal">
        <div class="modal-content">
            <h2>Jerry's Coin Run</h2>
            <p>Digite seu nome para começar!</p>

            <form id="start-form">
                <input
                    type="text"
                    id="player-input"
                    placeholder="Seu nome"
                    maxlength="50"
                    required
                >

                <button type="submit" id="btn-start">
                    Começar jogo
                </button>
            </form>

            <button type="button" id="btn-view-ranking">
                Ver ranking
            </button>
        </div>
    </div>

    <div class="modal" id="gameover-modal">
        <div class="modal-content">
            <h2>Fim de jogo!</h2>

            <p>Sua pontuação foi:</p>
            <h3 id="final-score-value">0</h3>

            <p id="save-status-msg"></p>

            <h3>Ranking — Top 10</h3>

            <table>
                <thead>
                    <tr>
                        <th>Posição</th>
                        <th>Jogador</th>
                        <th>Pontos</th>
                        <th>Data</th>
                    </tr>
                </thead>

                <tbody id="ranking-body">
                    <?php foreach ($ranking as $index => $jogador): ?>
                        <tr>
                            <td><?= $index + 1 ?></td>
                            <td><?= htmlspecialchars($jogador['nome']) ?></td>
                            <td><?= (int) $jogador['pontos'] ?></td>
                            <td><?= htmlspecialchars($jogador['data']) ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>

            <button type="button" id="btn-restart">
                Jogar novamente
            </button>

            <button type="button" id="btn-change-player">
                Trocar jogador
            </button>
        </div>
    </div>

</body>
</html>
