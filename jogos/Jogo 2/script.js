const player = document.getElementById('player');
const enemy = document.getElementById('enemy');
const gameContainer = document.getElementById('game-container');
const livesDisplay = document.getElementById('lives');
const scoreDisplay = document.getElementById('score');
const modal = document.getElementById('quiz-modal');
const questionText = document.getElementById('quiz-question');
const inputAnswer = document.getElementById('quiz-answer');
const submitBtn = document.getElementById('submit-answer');
const feedback = document.getElementById('quiz-feedback');
const door = document.getElementById('door');       // porta última plataforma
const doorTop = document.getElementById('door-top'); // porta plataforma mais alta

// Mensagem de nível concluído
const levelCompleteMsg = document.createElement('div');
levelCompleteMsg.id = 'level-complete';
levelCompleteMsg.style.position = 'absolute';
levelCompleteMsg.style.top = '50px';
levelCompleteMsg.style.left = '50%';
levelCompleteMsg.style.transform = 'translateX(-50%)';
levelCompleteMsg.style.fontSize = '32px';
levelCompleteMsg.style.color = '#0f0';
levelCompleteMsg.style.fontWeight = 'bold';
levelCompleteMsg.style.display = 'none';
levelCompleteMsg.style.zIndex = '200';
levelCompleteMsg.textContent = '🎉 Nível Concluído!';
gameContainer.appendChild(levelCompleteMsg);

let playerPos = { x: 50, y: 400 };
let velocityY = 0;
let gravity = 0.8;
let isJumping = false;
let keys = {};
let lives = 3;
let score = 0;
let isPaused = false;
let correctAnswer = 0;
let enteringDoor = false;

// Inimigo
let enemyPos = { x: 500, y: 370 };
let enemyVelocityY = 0;
let enemyGravity = 0.8;
let enemySpeed = 4;
let enemyJumpPower = 14;
let enemyIsJumping = false;

document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

function checkCollision(a, b) {
    return !(a.x + a.width < b.x ||
             a.x > b.x + b.width ||
             a.y + a.height < b.y ||
             a.y > b.y + b.height);
}

// Faz o jogador entrar na porta
function movePlayerIntoDoor(targetDoor) {
    enteringDoor = true;
    isPaused = true;
    targetDoor.classList.add('open');

    const interval = setInterval(() => {
        const doorX = parseInt(targetDoor.style.left);
        const doorY = parseInt(targetDoor.style.top);
        const doorCenterX = doorX + targetDoor.clientWidth/2 - player.clientWidth/2;
        const doorBottomY = doorY + targetDoor.clientHeight - player.clientHeight;

        if (playerPos.x < doorCenterX) playerPos.x += 2;
        if (playerPos.y < doorBottomY) playerPos.y += 2;

        player.style.left = playerPos.x + 'px';
        player.style.top = playerPos.y + 'px';

        if (playerPos.x >= doorCenterX && playerPos.y >= doorBottomY) {
            clearInterval(interval);
            enteringDoor = false;
            levelCompleteMsg.style.display = 'block';
            setTimeout(() => {
                levelCompleteMsg.style.display = 'none';
                isPaused = false;
            }, 3000);
        }
    }, 16);
}

function gameLoop() {
    requestAnimationFrame(gameLoop);
    if (isPaused && !enteringDoor) return;

    // --- Jogador ---
    if (!enteringDoor) {
        if (keys['ArrowRight'] || keys['d']) playerPos.x += 5;
        if (keys['ArrowLeft'] || keys['a']) playerPos.x -= 5;

        velocityY += gravity;
        playerPos.y += velocityY;

        document.querySelectorAll('.platform').forEach(platform => {
            const platRect = platform.getBoundingClientRect();
            const platTop = platRect.top - gameContainer.getBoundingClientRect().top;
            const platBottom = platRect.bottom - gameContainer.getBoundingClientRect().top;
            const platLeft = platRect.left - gameContainer.getBoundingClientRect().left;
            const platRight = platRect.right - gameContainer.getBoundingClientRect().left;

            const playerBottom = playerPos.y + player.clientHeight;
            const playerTop = playerPos.y;
            const playerLeft = playerPos.x;
            const playerRight = playerPos.x + player.clientWidth;

            if (playerBottom > platTop && playerTop < platTop && playerRight > platLeft && playerLeft < platRight && velocityY >= 0) {
                playerPos.y = platTop - player.clientHeight;
                velocityY = 0;
                isJumping = false;
            }

            if (playerTop < platBottom && playerBottom > platBottom && playerRight > platLeft && playerLeft < platRight && velocityY < 0) {
                playerPos.y = platBottom;
                velocityY = 0;
            }
        });

        if (playerPos.x < 0) playerPos.x = 0;
        if (playerPos.x > gameContainer.clientWidth - player.clientWidth) playerPos.x = gameContainer.clientWidth - player.clientWidth;
        if (playerPos.y > gameContainer.clientHeight - player.clientHeight) playerPos.y = gameContainer.clientHeight - player.clientHeight;

        if ((keys['ArrowUp'] || keys['w']) && !isJumping) {
            velocityY = -15;
            isJumping = true;
        }
    }

    player.style.left = playerPos.x + 'px';
    player.style.top = playerPos.y + 'px';

    // --- Inimigo ---
    if (!enteringDoor) {
        if (playerPos.x < enemyPos.x) enemyPos.x -= enemySpeed;
        else if (playerPos.x > enemyPos.x) enemyPos.x += enemySpeed;

        enemyVelocityY += enemyGravity;
        enemyPos.y += enemyVelocityY;

        document.querySelectorAll('.platform').forEach(platform => {
            const platRect = platform.getBoundingClientRect();
            const platTop = platRect.top - gameContainer.getBoundingClientRect().top;
            const platBottom = platRect.bottom - gameContainer.getBoundingClientRect().top;
            const platLeft = platRect.left - gameContainer.getBoundingClientRect().left;
            const platRight = platRect.right - gameContainer.getBoundingClientRect().left;

            const enemyBottom = enemyPos.y + enemy.clientHeight;
            const enemyTop = enemyPos.y;
            const enemyLeft = enemyPos.x;
            const enemyRight = enemyPos.x + enemy.clientWidth;

            if (enemyBottom > platTop && enemyTop < platTop && enemyRight > platLeft && enemyLeft < platRight && enemyVelocityY >= 0) {
                enemyPos.y = platTop - enemy.clientHeight;
                enemyVelocityY = 0;
                enemyIsJumping = false;
            }

            if (enemyTop < platBottom && enemyBottom > platBottom && enemyRight > platLeft && enemyLeft < platRight && enemyVelocityY < 0) {
                enemyPos.y = platBottom;
                enemyVelocityY = 0;
            }
        });

        if (!enemyIsJumping && playerPos.y + player.clientHeight < enemyPos.y) {
            enemyVelocityY = -enemyJumpPower;
            enemyIsJumping = true;
        }

        if (enemyPos.x < 0) enemyPos.x = 0;
        if (enemyPos.x > gameContainer.clientWidth - enemy.clientWidth) enemyPos.x = gameContainer.clientWidth - enemy.clientWidth;
    }

    enemy.style.left = enemyPos.x + 'px';
    enemy.style.top = enemyPos.y + 'px';

    // --- Colisão jogador x inimigo ---
    const playerRect = { x: playerPos.x, y: playerPos.y, width: player.clientWidth, height: player.clientHeight };
    const enemyRect = { x: enemyPos.x, y: enemyPos.y, width: enemy.clientWidth, height: enemy.clientHeight };

    if (!enteringDoor && checkCollision(playerRect, enemyRect)) {
        lives--;
        livesDisplay.textContent = '❤️'.repeat(lives);
        playerPos = { x: 50, y: 400 };
        velocityY = 0;
        enemyPos = { x: 500, y: 370 };
        enemyVelocityY = 0;
        enemyIsJumping = false;

        if (lives <= 0) {
            lives = 3;
            livesDisplay.textContent = '❤️❤️❤️';
            score = 0;
            scoreDisplay.textContent = score;
        }
    }

    // --- Colisão com recompensas ---
    document.querySelectorAll('.reward').forEach(reward => {
        if (!reward.taken && checkCollision(playerRect, {
            x: reward.offsetLeft, y: reward.offsetTop, width: reward.clientWidth, height: reward.clientHeight
        })) {
            reward.taken = true;
            score += 10;
            scoreDisplay.textContent = score;
            isPaused = true;
            reward.remove();
            showQuiz();
        }
    });

    // --- Colisão com portas ---
    if (!enteringDoor) {
        if (checkCollision(playerRect, { x: parseInt(door.style.left), y: parseInt(door.style.top), width: door.clientWidth, height: door.clientHeight }) && !door.classList.contains('open')) {
            movePlayerIntoDoor(door);
        }
        if (checkCollision(playerRect, { x: parseInt(doorTop.style.left), y: parseInt(doorTop.style.top), width: doorTop.clientWidth, height: doorTop.clientHeight }) && !doorTop.classList.contains('open')) {
            movePlayerIntoDoor(doorTop);
        }
    }
}

// --- Modal de quiz ---
function showQuiz() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    correctAnswer = num1 * num2;

    questionText.textContent = `Quanto é ${num1} × ${num2}?`;
    inputAnswer.value = '';
    feedback.textContent = '';
    modal.classList.remove('hidden');
}

submitBtn.addEventListener('click', () => {
    const userAnswer = parseInt(inputAnswer.value);
    if (userAnswer === correctAnswer) {
        feedback.textContent = '✅ Correto!';
        setTimeout(() => {
            modal.classList.add('hidden');
            isPaused = false;
        }, 500);
    } else {
        feedback.textContent = '❌ Tente novamente!';
    }
});

gameLoop();
