const personagemEscolhido = localStorage.getItem('personagemEscolhido');
let walkSpritePath;
let attackSpritePath;

if (personagemEscolhido === 'cavaleira') {
    walkSpritePath = "../design-jogo/cavaleira.gif";
    attackSpritePath = "../design-jogo/cavaleirabatendo.gif";
} else {
    walkSpritePath = "../design-jogo/cavaleiroandando.gif";
    attackSpritePath = "../design-jogo/cavaleirobatendo.gif";
}

const player = document.getElementById('player');
const sprite = document.getElementById('sprite');
sprite.src = walkSpritePath;

// Pré-carrega sprites
[
    walkSpritePath,
    attackSpritePath,
    "../design-jogo/ogrocapangabatendo.gif",
    "../design-jogo/ogrochefaoandando.gif",
    "../design-jogo/ogrochefaobatendo.gif",
    "../design-jogo/esmeralda02 (1).gif",
    "../design-jogo/comentario.png",
    "../design-jogo/cabeca.png",
    "../design-jogo/comentario2.png",
    "../design-jogo/cabecachefe.png"
].forEach(src => {
    const img = new Image();
    img.src = src;
});

const ogroCapangaAttackSprite = "../design-jogo/ogrocapangabatendo.gif";
const ogroChefeWalkSprite = "../design-jogo/ogrochefaoandando.gif";
const ogroChefeAttackSprite = "../design-jogo/ogrochefaobatendo.gif";

// HUD
const hud = document.createElement("div");
hud.id = "hud";
Object.assign(hud.style, {
    position: "absolute",
    top: "10px",
    left: "10px",
    display: "flex",
    gap: "5px",
    zIndex: "999"
});
document.body.appendChild(hud);

// Contador de esmeraldas
const esmeraldasHUD = document.createElement("div");
esmeraldasHUD.id = "esmeraldas-hud";
Object.assign(esmeraldasHUD.style, {
    position: "absolute",
    top: "10px",
    right: "10px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    zIndex: "999",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: "5px 10px",
    borderRadius: "5px",
    color: "white",
    fontSize: "18px",
    fontWeight: "bold"
});
document.body.appendChild(esmeraldasHUD);

const totalHearts = 5;
const heartElements = [];
for (let i = 0; i < totalHearts; i++) {
    const heart = document.createElement("span");
    heart.innerHTML = "❤️";
    heart.style.fontSize = "24px";
    hud.appendChild(heart);
    heartElements.push(heart);
}

let playerX = 0;
const playerSpeed = 3;
let playerHealth = 10;
let playerDead = false;
let playerInvulnerable = false;
const INVULNERABILITY_TIME = 800;
let esmeraldasColetadas = 0;

const keys = { a: false, d: false, ArrowLeft: false, ArrowRight: false };
let attacking = false;

const ENEMY_TOP = 495;
let jogoPausado = false;

// Inimigos iniciais
const enemies = [
    { element: document.getElementById('enemy'), x: 100, speed: 1.5, alive: true, health: 3, isBoss: false },
    { element: document.getElementById('enemy1'), x: 250, speed: 1.8, alive: true, health: 3, isBoss: false },
    { element: document.getElementById('enemy2'), x: 400, speed: 1.6, alive: true, health: 3, isBoss: false },
    { element: document.getElementById('enemy3'), x: 550, speed: 1.7, alive: true, health: 3, isBoss: false },
];

const GAME_WIDTH = 800;
const POSICAO_FINAL = GAME_WIDTH - 50;
let cenarioMudado = false;

// Atualiza HUD
function updateHUD() {
    const heartsToShow = Math.ceil(playerHealth / 2);
    heartElements.forEach((h, i) => {
        h.innerHTML = i < heartsToShow ? "❤️" : "🤍";
    });
    
    // Atualiza contador de esmeraldas
    esmeraldasHUD.innerHTML = `💎 ${esmeraldasColetadas}`;
}

// Funções para balões de fala (fase 1 e chefe)
function mostrarBalao(texto, callback) {
    jogoPausado = true;
    const gameContainer = document.querySelector('.game-container');

    const container = document.createElement('div');
    container.style.position = "absolute";
    container.style.top = "50px";   
    container.style.left = "50%";   
    container.style.transform = "translateX(-50%)"; 
    container.style.zIndex = "1000";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";

    const balao = document.createElement('div');
    balao.style.position = "relative";
    balao.style.width = "300px";
    balao.style.height = "230px";
    balao.style.backgroundImage = "url('../design-jogo/comentario.png')";
    balao.style.backgroundSize = "100% 100%";
    balao.style.backgroundRepeat = "no-repeat";
    balao.style.display = "flex";
    balao.style.alignItems = "center";
    balao.style.justifyContent = "center";
    balao.style.marginBottom = "-40px";

    const fala = document.createElement('p');
    fala.textContent = texto;
    fala.style.color = "#4b2e1f";
    fala.style.fontWeight = "bold";
    fala.style.fontSize = "18px";
    fala.style.width = "260px";
    fala.style.textAlign = "center";
    fala.style.margin = "0";

    const aviso = document.createElement('p');
    aviso.textContent = "[ESPAÇO] para continuar";
    aviso.style.position = "absolute";
    aviso.style.bottom = "-125px";
    aviso.style.left = "50%";
    aviso.style.transform = "translateX(-50%)";
    aviso.style.color = "white";
    aviso.style.fontSize = "14px";
    aviso.style.textShadow = "2px 2px 5px black";

    balao.appendChild(fala);
    balao.appendChild(aviso);

    const cabeca = document.createElement('img');
    cabeca.src = "../design-jogo/cabeca.png";
    cabeca.style.width = "120px";
    cabeca.style.height = "120px";
    cabeca.style.imageRendering = "pixelated";
    cabeca.style.marginTop = "20px";  
    cabeca.style.marginLeft = "-200px";

    cabeca.animate([{ transform: "translateY(0px)" }, { transform: "translateY(-5px)" }, { transform: "translateY(0px)" }], { duration: 500, iterations: Infinity });

    container.appendChild(balao);
    container.appendChild(cabeca);
    gameContainer.appendChild(container);

    function fecharBalao(e) {
        if (e.code === "Space") {
            container.remove();
            document.removeEventListener("keydown", fecharBalao);
            jogoPausado = false;
            if (callback) callback();
        }
    }

    document.addEventListener("keydown", fecharBalao);
}

function mostrarBalaoChefe(texto, callback) {
    jogoPausado = true;
    const gameContainer = document.querySelector('.game-container');

    const container = document.createElement('div');
    container.style.position = "absolute";
    container.style.top = "50px";   
    container.style.left = "50%";   
    container.style.transform = "translateX(-50%)"; 
    container.style.zIndex = "1000";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";

    const balao = document.createElement('div');
    balao.style.position = "relative";
    balao.style.width = "300px";
    balao.style.height = "180px";
    balao.style.backgroundImage = "url('../design-jogo/comentario2.png')";
    balao.style.backgroundSize = "100% 100%";
    balao.style.backgroundRepeat = "no-repeat";
    balao.style.display = "flex";
    balao.style.alignItems = "center";
    balao.style.justifyContent = "center";
    balao.style.marginBottom = "-40px";

    const fala = document.createElement('p');
    fala.textContent = texto;
    fala.style.color = "#4b2e1f";
    fala.style.fontWeight = "bold";
    fala.style.fontSize = "18px";
    fala.style.width = "260px";
    fala.style.textAlign = "center";
    fala.style.margin = "0";

    const aviso = document.createElement('p');
    aviso.textContent = "[ESPAÇO] para continuar";
    aviso.style.position = "absolute";
    aviso.style.bottom = "-125px"; 
    aviso.style.left = "50%";
    aviso.style.transform = "translateX(-50%)";
    aviso.style.color = "white";
    aviso.style.fontSize = "14px";
    aviso.style.textShadow = "2px 2px 5px black";

    balao.appendChild(fala);
    balao.appendChild(aviso);

    const cabecaChefe = document.createElement('img');
    cabecaChefe.src = "../design-jogo/cabecachefe.png";
    cabecaChefe.style.width = "120px";
    cabecaChefe.style.height = "120px";
    cabecaChefe.style.imageRendering = "pixelated";
    cabecaChefe.style.marginTop = "20px";  
    cabecaChefe.style.marginLeft = "-200px";

    cabecaChefe.animate([{ transform: "translateY(0px)" }, { transform: "translateY(-5px)" }, { transform: "translateY(0px)" }], { duration: 500, iterations: Infinity });

    container.appendChild(balao);
    container.appendChild(cabecaChefe);
    gameContainer.appendChild(container);

    function fecharBalao(e) {
        if (e.code === "Space") {
            container.remove();
            document.removeEventListener("keydown", fecharBalao);
            jogoPausado = false;
            if (callback) callback();
        }
    }

    document.addEventListener("keydown", fecharBalao);
}

// MOVIMENTAÇÃO, ATAQUES, COLISÕES
function movePlayer() {
    if (attacking || playerDead || jogoPausado) return;

    if (keys.a || keys.ArrowLeft) playerX -= playerSpeed;
    if (keys.d || keys.ArrowRight) playerX += playerSpeed;

    playerX = Math.max(0, Math.min(POSICAO_FINAL, playerX));
    player.style.left = playerX + 'px';

    if (playerX >= POSICAO_FINAL && !cenarioMudado) {
        mudarFundo();
    }
}

function mudarFundo() {
    cenarioMudado = true;
    const gameContainer = document.querySelector('.game-container');
    gameContainer.classList.add('nova-fase');

    enemies.forEach(enemy => {
        enemy.element.style.display = "none";
        enemy.alive = false;
    });

    const ogroChefe = document.createElement('div');
    ogroChefe.classList.add('enemy');
    Object.assign(ogroChefe.style, {
        left: '70%',
        top: ENEMY_TOP + 'px',
        position: 'absolute',
        transform: 'scale(5)',
        imageRendering: 'pixelated',
    });
    ogroChefe.innerHTML = `<img src="${ogroChefeWalkSprite}" style="image-rendering: pixelated;">`;
    gameContainer.appendChild(ogroChefe);

    enemies.push({
        element: ogroChefe,
        x: GAME_WIDTH * 0.7,
        speed: 1.5,
        alive: true,
        health: 7,
        isBoss: true
    });

    playerX = 0;
    player.style.left = playerX + 'px';

    mostrarBalaoChefe("Você não irá me impedir! Prepare-se para morrer!", () => {});
}

function moveEnemies() {
    if (jogoPausado) return;

    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        const dx = playerX - enemy.x;
        if (Math.abs(dx) > 35) enemy.x += Math.sign(dx) * enemy.speed;
        enemy.element.style.left = enemy.x + 'px';

        const img = enemy.element.querySelector("img");
        if (!img.dataset.walkSet) {
            img.src = enemy.isBoss ? ogroChefeWalkSprite : "../design-jogo/ogrocapangaandando.gif";
            img.dataset.walkSet = true;
        }
    });
}

function attackPlayer(enemy) {
    if (playerDead || playerInvulnerable || jogoPausado) return;
    if (Math.abs(playerX - enemy.x) < 40) {
        playerHealth--;
        updateHUD();
        playerInvulnerable = true;
        setTimeout(() => playerInvulnerable = false, INVULNERABILITY_TIME);

        const img = enemy.element.querySelector("img");
        img.src = enemy.isBoss ? ogroChefeAttackSprite : ogroCapangaAttackSprite;

        setTimeout(() => {
            if (enemy.alive) img.src = enemy.isBoss ? ogroChefeWalkSprite : "../design-jogo/ogrocapangaandando.gif";
        }, 500);

        if (playerHealth <= 0 && !playerDead) playerDead = true, showGameOverScreen();
    }
}

function attackEnemies() {
    if (jogoPausado) return;

    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        if (Math.abs(playerX - enemy.x) < 60) {
            enemy.health -= enemy.isBoss ? 1 : 2;
            if (enemy.health <= 0) {
                enemy.alive = false;
                enemy.element.style.display = "none";
                
                // Drop de esmeraldas para todos os inimigos
                console.log("Inimigo morreu, dropando esmeralda...", enemy);
                if (enemy.isBoss) {
                    // Chefe dropa mais esmeraldas
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            console.log("Dropando esmeralda do chefe", i);
                            droparGema(enemy);
                        }, i * 200);
                    }
                } else {
                    // Inimigos comuns dropam 1 esmeralda
                    console.log("Dropando esmeralda do inimigo comum");
                    droparGema(enemy);
                }
            }
        }
    });
}

// COLISÕES PLAYER
function checkCollisions() {
    if (jogoPausado) return;
    const playerRect = player.getBoundingClientRect();
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        const enemyRect = enemy.element.getBoundingClientRect();
        if (playerRect.x < enemyRect.x + enemyRect.width &&
            playerRect.x + playerRect.width > enemyRect.x &&
            playerRect.y < enemyRect.y + enemyRect.height &&
            playerRect.y + playerRect.height > enemyRect.y) {
                attackPlayer(enemy);
        }
    });

    checkGemCollisions();
}

// GEMAS
function droparGema(inimigo) {
    console.log("Dropando esmeralda do inimigo:", inimigo); // Debug
    
    const gameContainer = document.querySelector('.game-container');
    
    // Se o inimigo não existir mais, usar posição padrão
    let posX, posYInicial;
    
    if (inimigo && inimigo.element) {
        const rect = inimigo.element.getBoundingClientRect();
        const gameRect = gameContainer.getBoundingClientRect();
        const offsetX = (Math.random() - 0.5) * 40;
        posX = rect.x - gameRect.x + offsetX;
        posYInicial = rect.y - gameRect.y;
    } else {
        // Posição padrão se o inimigo não existir
        posX = 400 + (Math.random() - 0.5) * 100;
        posYInicial = 200;
    }

    const gema = document.createElement('img');
    gema.classList.add('gem-drop');
    gema.src = "../design-jogo/esmeralda02 (1).gif";
    gema.style.position = "absolute";
    
    // Fallback caso a imagem não carregue
    gema.onerror = function() {
        console.log("Erro ao carregar imagem da esmeralda, usando fallback");
        gema.style.backgroundColor = "#00ff00";
        gema.style.borderRadius = "50%";
        gema.style.border = "2px solid #ffffff";
    };
    
    console.log("Posições:", { posX, posYInicial }); // Debug
    
    gema.style.left = posX + "px";
    gema.style.top = posYInicial + "px";
    gema.style.width = "28px";
    gema.style.height = "28px";
    gema.style.imageRendering = "pixelated";
    gema.style.zIndex = "100";
    
    // Adiciona brilho à esmeralda
    gema.style.filter = "drop-shadow(0 0 5px #00ff00)";
    gema.style.animation = "gemGlow 2s ease-in-out infinite alternate";
    
    gameContainer.appendChild(gema);
    console.log("Esmeralda adicionada ao container"); // Debug

    // Queda da gema até o chão com física mais realista
    let posY = posYInicial;
    let velocidadeY = 0;
    const chão = 522; // 600 - 50 - 28
    const gravidade = 0.8;
    let chegouAoChao = false;
    let rotacao = 0;
    
    console.log("Iniciando animação de queda. Chão:", chão); // Debug
    
    function animarQueda() {
        if (chegouAoChao) return;
        
        if (posY >= chão) {
            posY = chão;
            gema.style.top = posY + "px";
            gema.style.transform = "rotate(0deg) scale(1.2)";
            chegouAoChao = true;
            console.log("Esmeralda chegou ao chão"); // Debug
            
            // Efeito de impacto no chão
            setTimeout(() => {
                gema.style.transform = "rotate(0deg) scale(1)";
            }, 100);
            
            // Timer para desaparecer após 10 segundos
            setTimeout(() => {
                if (gema.parentNode) {
                    gema.style.opacity = "0";
                    gema.style.transition = "opacity 1s ease-out";
                    setTimeout(() => {
                        if (gema.parentNode) {
                            gema.remove();
                        }
                    }, 1000);
                }
            }, 10000);
        } else {
            velocidadeY += gravidade;
            posY += velocidadeY; // Movendo para baixo (aumentando Y)
            rotacao += 3; // Rotação durante a queda
            
            gema.style.top = posY + "px";
            gema.style.transform = `rotate(${rotacao}deg)`;
            requestAnimationFrame(animarQueda);
        }
    }
    
    // Inicia a animação de queda
    requestAnimationFrame(animarQueda);
}

// Coletar gemas
function checkGemCollisions() {
    const playerRect = player.getBoundingClientRect();
    const gems = document.querySelectorAll('.gem-drop');

    gems.forEach(gema => {
        const gemRect = gema.getBoundingClientRect();

        if (
            playerRect.x < gemRect.x + gemRect.width &&
            playerRect.x + playerRect.width > gemRect.x &&
            playerRect.y < gemRect.y + gemRect.height &&
            playerRect.y + playerRect.height > gemRect.y
        ) {
            coletarEsmeralda(gema);
        }
    });
}

// Função para coletar esmeralda com efeitos
function coletarEsmeralda(gema) {
    esmeraldasColetadas++;
    updateHUD();
    
    // Efeito visual de coleta
    mostrarEfeitoColeta(gema);
    
    // Remove a esmeralda
    gema.remove();
    
    // Som de coleta (se disponível)
    playCollectSound();
    
    // Mensagens especiais para marcos de coleta
    if (esmeraldasColetadas === 5) {
        mostrarMensagemEspecial("🎉 5 Esmeraldas coletadas! Você está indo bem!");
    } else if (esmeraldasColetadas === 10) {
        mostrarMensagemEspecial("💎 10 Esmeraldas! Você é um verdadeiro caçador de tesouros!");
    } else if (esmeraldasColetadas === 20) {
        mostrarMensagemEspecial("🏆 20 Esmeraldas! Lenda das gemas!");
    }
}

// Função para mostrar mensagens especiais
function mostrarMensagemEspecial(texto) {
    const gameContainer = document.querySelector('.game-container');
    
    const mensagem = document.createElement('div');
    mensagem.style.position = 'absolute';
    mensagem.style.top = '50%';
    mensagem.style.left = '50%';
    mensagem.style.transform = 'translate(-50%, -50%)';
    mensagem.style.color = '#FFD700';
    mensagem.style.fontSize = '24px';
    mensagem.style.fontWeight = 'bold';
    mensagem.style.textShadow = '3px 3px 6px rgba(0,0,0,0.8)';
    mensagem.style.zIndex = '1000';
    mensagem.style.textAlign = 'center';
    mensagem.style.pointerEvents = 'none';
    mensagem.textContent = texto;
    
    gameContainer.appendChild(mensagem);
    
    // Animação da mensagem
    mensagem.animate([
        { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0 },
        { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 1 },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 }
    ], {
        duration: 3000,
        easing: 'ease-in-out'
    }).onfinish = () => {
        mensagem.remove();
    };
}

// Efeito visual quando coleta esmeralda
function mostrarEfeitoColeta(gema) {
    const gameContainer = document.querySelector('.game-container');
    const rect = gema.getBoundingClientRect();
    const gameRect = gameContainer.getBoundingClientRect();
    
    const efeito = document.createElement('div');
    efeito.style.position = 'absolute';
    efeito.style.left = (rect.x - gameRect.x) + 'px';
    efeito.style.top = (rect.y - gameRect.y) + 'px';
    efeito.style.color = '#00ff00';
    efeito.style.fontSize = '20px';
    efeito.style.fontWeight = 'bold';
    efeito.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
    efeito.style.zIndex = '1000';
    efeito.textContent = '+1 💎';
    efeito.style.pointerEvents = 'none';
    
    gameContainer.appendChild(efeito);
    
    // Animação do efeito
    efeito.animate([
        { transform: 'translateY(0px)', opacity: 1 },
        { transform: 'translateY(-30px)', opacity: 0 }
    ], {
        duration: 1000,
        easing: 'ease-out'
    }).onfinish = () => {
        efeito.remove();
    };
}

// Som de coleta (usando Web Audio API)
function playCollectSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Silenciosamente ignora erros de áudio
    }
}

// LOOP DO JOGO
function gameLoop() {
    if (!document.hasFocus()) { requestAnimationFrame(gameLoop); return; }

    movePlayer();
    moveEnemies();
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

// BALÃO INICIAL DOS CAPANGAS
mostrarBalao("Atenção ogros! Protejam o castelo, o chefe está roubando as gemas!", () => {});

// CONTROLES
document.addEventListener('keydown', e => {
    if (e.key === ' ' && !attacking && !playerDead && !jogoPausado) {
        attacking = true;
        sprite.src = attackSpritePath;
        attackEnemies();
        setTimeout(() => {
            attacking = false;
            if (!playerDead) sprite.src = walkSpritePath;
        }, 400);
    } else if (e.key in keys) keys[e.key] = true;
});

document.addEventListener('keyup', e => {
    if (e.key in keys) keys[e.key] = false;
    if (!Object.values(keys).some(v => v) && !attacking && !playerDead && !jogoPausado) sprite.src = walkSpritePath;
});

// GAME OVER
function showGameOverScreen() {
    const gameOverScreen = document.createElement('div');
    gameOverScreen.id = 'game-over-screen';
    Object.assign(gameOverScreen.style, {
        position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.7)', color: 'white',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        zIndex: '1001', fontSize: '48px', fontFamily: 'Arial, sans-serif'
    });
    gameOverScreen.innerHTML = `<p>VOCÊ MORREU</p>
        <button id="restart-button" style="margin-top:20px; padding:10px 20px; font-size:20px; border:none; border-radius:8px; background-color:#ff4444; color:white; cursor:pointer;">Jogar Novamente</button>`;
    document.querySelector('.game-container').appendChild(gameOverScreen);
    document.getElementById('restart-button').addEventListener('click', () => window.location.reload());
}

// Função de teste para esmeraldas (pode ser chamada no console)
function testarEsmeralda() {
    console.log("Testando drop de esmeralda...");
    const gameContainer = document.querySelector('.game-container');
    
    const gema = document.createElement('img');
    gema.classList.add('gem-drop');
    gema.src = "../design-jogo/esmeralda02 (1).gif";
    gema.style.position = "absolute";
    gema.style.left = "400px";
    gema.style.top = "100px";
    gema.style.width = "28px";
    gema.style.height = "28px";
    gema.style.imageRendering = "pixelated";
    gema.style.zIndex = "100";
    gema.style.filter = "drop-shadow(0 0 5px #00ff00)";
    
    gameContainer.appendChild(gema);
    
    // Animação de queda simples
    let posY = 100;
    let velocidadeY = 0;
    const gravidade = 0.8;
    const chão = 522; // 600 - 50 - 28
    
    function animarQueda() {
        if (posY >= chão) {
            posY = chão;
            gema.style.top = posY + "px";
            console.log("Esmeralda de teste chegou ao chão!");
        } else {
            velocidadeY += gravidade;
            posY += velocidadeY;
            gema.style.top = posY + "px";
            requestAnimationFrame(animarQueda);
        }
    }
    
    requestAnimationFrame(animarQueda);
}

// Inicializa
updateHUD();
gameLoop();
