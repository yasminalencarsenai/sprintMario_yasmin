
document.addEventListener('DOMContentLoaded', () => {
    const jerry = document.querySelector('.mario');
    const pipe = document.querySelector('.pipe');
    const cheese = document.querySelector('.cheese');
    const gameBoard = document.getElementById('game-board');

    const hudPlayerName = document.getElementById('player-name');
    const scoreDisplay = document.getElementById('score');

    const startModal = document.getElementById('start-modal');
    const startForm = document.getElementById('start-form');
    const playerInput = document.getElementById('player-input');
    const btnViewRanking = document.getElementById('btn-view-ranking');

    const gameoverModal = document.getElementById('gameover-modal');
    const finalScoreValue = document.getElementById('final-score-value');
    const saveStatusMsg = document.getElementById('save-status-msg');
    const rankingBody = document.getElementById('ranking-body');
    const btnRestart = document.getElementById('btn-restart');
    const btnChangePlayer = document.getElementById('btn-change-player');

    let currentPlayer = '';
    let score = 0;
    let isPlaying = false;
    let gameLoop = null;
    let scoreLoop = null;
    let cheeseTimeout = null;
    let cheeseCollected = false;

    const savedName = localStorage.getItem('jerry_run_player');

    if (savedName && playerInput) {
        playerInput.value = savedName;
    }

    function startGame() {
        clearInterval(gameLoop);
        clearInterval(scoreLoop);
        clearTimeout(cheeseTimeout);

        resetElements();

        score = 0;
        isPlaying = true;

        scoreDisplay.textContent = '0';
        hudPlayerName.textContent = currentPlayer || 'Jogador';

        startModal.classList.remove('active');
        gameoverModal.classList.remove('active');

        gameBoard.classList.add('running');

        scoreLoop = setInterval(() => {
            if (isPlaying) {
                score++;
                scoreDisplay.textContent = score;
            }
        }, 100);

        gameLoop = setInterval(checkCollision, 10);
    }

    function resetElements() {
        pipe.style.animation = '';
        pipe.style.left = '';
        pipe.style.right = '-60px';

        cheese.style.animation = 'none';
        cheese.style.right = '-30px';
        cheese.style.visibility = 'visible';

        jerry.src = 'assets/jerry_sem_fundo.gif';
        jerry.style.animation = '';
        jerry.style.bottom = '0px';
        jerry.style.width = '';
        jerry.style.marginLeft = '';
        jerry.classList.remove('jump');

        cheeseCollected = false;
        clearTimeout(cheeseTimeout);

        // Reinicia a animação do queijo.
        void cheese.offsetWidth;
        cheese.style.animation = '';
    }

    function jump() {
        if (!isPlaying || jerry.classList.contains('jump')) {
            return;
        }

        jerry.classList.add('jump');

        setTimeout(() => {
            jerry.classList.remove('jump');
        }, 500);
    }

    function checkCollision() {
        if (!isPlaying) {
            return;
        }

        const jerryRect = jerry.getBoundingClientRect();
        const pipeRect = pipe.getBoundingClientRect();

        // Área menor para evitar colisões injustas com o Jerry.
        const jerryLeft = jerryRect.left + 35;
        const jerryRight = jerryRect.right - 25;
        const jerryTop = jerryRect.top + 25;
        const jerryBottom = jerryRect.bottom - 10;

        const pipeLeft = pipeRect.left + 10;
        const pipeRight = pipeRect.right - 10;
        const pipeTop = pipeRect.top + 5;

        const colidiuComObstaculo =
            jerryRight > pipeLeft &&
            jerryLeft < pipeRight &&
            jerryBottom > pipeTop;

        if (colidiuComObstaculo) {
            triggerGameOver();
            return;
        }

        // Verifica se Jerry pegou o queijo.
        if (!cheeseCollected && cheese.style.visibility !== 'hidden') {
            const cheeseRect = cheese.getBoundingClientRect();

            const pegouQueijo =
                jerryRight > cheeseRect.left + 3 &&
                jerryLeft < cheeseRect.right - 3 &&
                jerryBottom > cheeseRect.top + 3 &&
                jerryTop < cheeseRect.bottom - 3;

            if (pegouQueijo) {
                collectCheese();
            }
        }
    }

    function collectCheese() {
        if (cheeseCollected || !isPlaying) {
            return;
        }

        cheeseCollected = true;
        score += 10;
        scoreDisplay.textContent = score;

        cheese.style.visibility = 'hidden';

        // Faz o queijo reaparecer depois de um instante.
        clearTimeout(cheeseTimeout);

        cheeseTimeout = setTimeout(() => {
            if (!isPlaying) {
                return;
            }

            cheese.style.animation = 'none';
            cheese.style.right = '-30px';
            cheese.style.visibility = 'visible';

            cheeseCollected = false;

            // Reinicia a animação para o queijo atravessar a tela novamente.
            void cheese.offsetWidth;
            cheese.style.animation = '';
        }, 1200);
    }

    function triggerGameOver() {
        if (!isPlaying) {
            return;
        }

        isPlaying = false;

        clearInterval(gameLoop);
        clearInterval(scoreLoop);
        clearTimeout(cheeseTimeout);

        gameBoard.classList.remove('running');

        pipe.style.animation = 'none';
        cheese.style.animation = 'none';
        jerry.style.animation = 'none';

        finalScoreValue.textContent = score;
        saveStatusMsg.textContent = 'Salvando pontuação...';

        gameoverModal.classList.add('active');

        saveScore(currentPlayer, score);
    }

    function saveScore(nome, pontos) {
        fetch('salvar_ranking.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nome,
                pontos: pontos
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                saveStatusMsg.textContent =
                    'Pontuação salva com sucesso!';

                renderRanking(data.ranking || []);
            } else {
                saveStatusMsg.textContent =
                    data.message || 'Erro ao salvar a pontuação.';
            }
        })
        .catch(() => {
            saveStatusMsg.textContent =
                'Erro ao conectar com o servidor.';
        });
    }

    function fetchRanking() {
        fetch('obter_ranking.php')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                renderRanking(data.ranking || []);
            } else {
                saveStatusMsg.textContent =
                    'Não foi possível carregar o ranking.';
            }
        })
        .catch(() => {
            saveStatusMsg.textContent =
                'Erro ao carregar o ranking.';
        });
    }

    function renderRanking(lista) {
        rankingBody.innerHTML = '';

        if (!lista.length) {
            rankingBody.innerHTML =
                '<tr><td colspan="4">Nenhuma pontuação registrada ainda!</td></tr>';
            return;
        }

        lista.forEach((item, index) => {
            const tr = document.createElement('tr');
            const data = item.data || '';

            tr.innerHTML =
                '<td>' + (index + 1) + 'º</td>' +
                '<td>' + escapeHtml(item.nome) + '</td>' +
                '<td>' + parseInt(item.pontos, 10) + '</td>' +
                '<td>' + escapeHtml(data) + '</td>';

            rankingBody.appendChild(tr);
        });
    }

    function escapeHtml(texto) {
        return String(texto || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    startForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = playerInput.value.trim();

        if (!nome) {
            playerInput.focus();
            return;
        }

        currentPlayer = nome;
        localStorage.setItem('jerry_run_player', currentPlayer);

        startGame();
    });

    btnViewRanking.addEventListener('click', () => {
        finalScoreValue.textContent = '---';
        saveStatusMsg.textContent = '';

        startModal.classList.remove('active');
        gameoverModal.classList.add('active');

        fetchRanking();
    });

    btnRestart.addEventListener('click', () => {
        if (!currentPlayer) {
            gameoverModal.classList.remove('active');
            startModal.classList.add('active');
            return;
        }

        startGame();
    });

    btnChangePlayer.addEventListener('click', () => {
        clearInterval(gameLoop);
        clearInterval(scoreLoop);
        clearTimeout(cheeseTimeout);

        isPlaying = false;

        gameBoard.classList.remove('running');
        gameoverModal.classList.remove('active');
        startModal.classList.add('active');

        playerInput.value = '';
        currentPlayer = '';

        localStorage.removeItem('jerry_run_player');

        resetElements();
        playerInput.focus();
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            if (isPlaying) {
                e.preventDefault();
                jump();
            }
        }
    });

    gameBoard.addEventListener('click', jump);

    // Exibe a tela inicial ao abrir o jogo.
    gameoverModal.classList.remove('active');
    startModal.classList.add('active');
});
