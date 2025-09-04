console.log("Script carregado");
function startGame() {
    const personagem = localStorage.getItem('personagemEscolhido');
    if (personagem) {
        window.location.href = '../codigo-jogo/jogo.html';
    } else {
        alert('Por favor, escolha um personagem antes de começar o jogo!');
    }
}

function verPersonagens() {
    window.location.href = 'personagems.html';
}
