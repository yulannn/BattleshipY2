// Concaténation de float en int (0.8 -> 0)
export function float2int(value) {
    return value | 0;
}

// Fonction pour trier les blocs qui n'ont pas encore été touchés
export function notAlreadyHit(possibleBlock) {
    return possibleBlock.filter(block => {
        const blockElement = document.querySelector(`#player div[id='${block}']`);
        return blockElement && !blockElement.classList.contains('hit') && !blockElement.classList.contains('miss');
    });
}

// Fonction pour trier uniquement les blocs dans le plateau
export function allInBoard(possibleBlock, width) {
    return possibleBlock.filter(block => block >= 0 && block < width * width);
}

// Fonction pour vérifier si un navire est coulé dans un plateau
export function checkKill(user, ship) {
    let shipBlocks = document.querySelectorAll(`#${user} .${ship}`);
    let shipHits = 0;

    shipBlocks.forEach(shipBlock => {
        if (shipBlock.classList.contains('hit')) {
            shipHits++;
        }
    });



    if (shipHits === shipBlocks.length) {
        shipBlocks.forEach(shipBlock => {
            shipBlock.style.backgroundColor = 'red';
        });
        return true
    }
    return false;
}

// Création des plateaux de jeu
export function createBoard(player, color, border, width) {
    const gamesboardContainer = document.querySelector('#gamesboard__container');
    const playingBoard = document.createElement('div');
    playingBoard.classList.add('gamesboard');
    playingBoard.style.backgroundColor = color;
    playingBoard.style.border = border
    playingBoard.id = player;
    gamesboardContainer.append(playingBoard)

    for (let i = 0; i < width * width; i++) {
        const block = document.createElement('div');
        block.id = i;
        block.classList.add('block')
        playingBoard.append(block);
    }
}