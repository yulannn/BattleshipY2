// Importation fonctions

import { float2int, notAlreadyHit, allInBoard, checkKill, createBoard } from './utilities.js';
import { ships } from './ships.js';

// Variables globales

const optionContainer = document.querySelector('.option__container')

let angle = 0;
let width = 10;
let notDropped = false
let draggedShip
let doubleTurn = false
let doubleTurnComputer = false

createBoard('player', 'black', '1px solid blue', width)
createBoard('computer', 'black', '1px solid red', width)

document.querySelector("#reset_button").addEventListener('click', () => {
    location.reload()
})
// Fonctionnalité pour ajouter les navires aléatoirement
const randomBtn = document.querySelector('#random_button');
randomBtn.addEventListener('click', randomShips)

function randomShips() {
    flipBtn.removeEventListener('click', flipShip)
    randomBtn.removeEventListener('click', randomShips)
    flipBtn.id = ''
    randomBtn.id = ''
    flipBtn.classList.add('disabled-btn')
    randomBtn.classList.add('disabled-btn')

    ships.forEach(ship => {
        let set = false;
        while (!set) {
            if (addPlayerPiece(ship, Math.floor(Math.random() * width * width), true)) {
                const dragShip = document.querySelector(`.${ship.name}-preview`);
                dragShip.remove();
                set = true;
            }
        }
    })
}


// Fonctionnalité pour retourner les navires
const flipBtn = document.querySelector('#flip_button');

function flipShip() {
    const optionShips = Array.from(optionContainer.children)
    angle = angle === 0 ? 90 : 0;
    optionShips.forEach(ship => ship.style.transform = `rotate(${angle}deg)`);
}

flipBtn.addEventListener('click', flipShip)


// Fonction pour vérifier si tous les blocs sont valides (dans le plateau, même ligne, pas de collision)
function allBlocksValids(shipBlocks, isHorizontal) {

    // All in board

    for (const block of shipBlocks) {
        if (block === undefined) {
            return false;
        }
    }

    // All in same row

    if (isHorizontal) {
        let divided = [];
        shipBlocks.forEach(block => {
            divided.push(float2int(block.id / 10));
        });

        const first_nb = divided[0];
        for (const elt of divided) {
            if (elt !== first_nb) {
                return false;
            }
        }
    }

    // No collision 
    for (const block of shipBlocks) {
        if (block.classList.contains('taken') || block.classList.contains('player-taken')) {
            return false;
        }
    }
    return true;
}

// Fonction pour ajouter un navire du joueur le plateau
function addPlayerPiece(ship, startId, randomHorizontal = false) {
    const allPlayerBoardBlocks = document.querySelectorAll("#player div");
    let isHorizontal;
    if (!randomHorizontal) {
        isHorizontal = angle === 0;
    } else {
        isHorizontal = Math.random() < 0.5;
    }

    let shipBlocks = [];

    // Collecter les blocs pour le navire
    for (let i = 0; i < ship.lenght; i++) {
        if (isHorizontal) {
            shipBlocks.push(allPlayerBoardBlocks[Number(startId) + i]);
        } else {
            shipBlocks.push(allPlayerBoardBlocks[Number(startId) + i * width]);
        }
    }

    if (allBlocksValids(shipBlocks, isHorizontal)) {
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add(ship.name);
            shipBlock.classList.add('player-taken');
        });
        notDropped = false;
        return true;
    } else {
        notDropped = true;
        return false;
    }
}

// Fonction pour ajouter un navire de l'ordinateur sur le plateau
function addShipPiece(ship) {
    const allBoardBlocks = document.querySelectorAll('#computer div');
    let isHorizontal = Math.random() < 0.5;
    let shipBlocks = [undefined];

    while (!allBlocksValids(shipBlocks, isHorizontal)) {
        shipBlocks = [];
        let randomStartIndex = Math.floor(Math.random() * width * width)
        for (let i = 0; i < ship.lenght; i++) {
            if (isHorizontal) {
                shipBlocks.push(allBoardBlocks[Number(randomStartIndex) + i])
            } else {
                shipBlocks.push(allBoardBlocks[Number(randomStartIndex) + i * width])
            }
        }
    }

    shipBlocks.forEach(shipBlock => {
        shipBlock.classList.add(ship.name);
        shipBlock.classList.add('taken');
    });
}

// Ajouter les navires de l'ordinateur sur le plateau
ships.forEach(ship => {
    addShipPiece(ship)
})

// Drag and drop des navires du joueur
const optionContent = Array.from(optionContainer.children)
optionContent.forEach(optionShip => optionShip.addEventListener('dragstart', dragStart))

const allPlayerBlocks = document.querySelectorAll("#player div")
allPlayerBlocks.forEach(playerBlock => {
    playerBlock.addEventListener('dragover', dragOver)
    playerBlock.addEventListener('dragleave', dragLeave)
    playerBlock.addEventListener('drop', dropShip)
})


function dragStart(e) {
    draggedShip = e.target;
    notDropped = false;
}

function dragLeave(e) {
    const shipLength = ships[draggedShip.id].lenght;
    const targetId = Number(e.target.id);
    const isHorizontal = angle === 0;
    const shipPreviewBlocks = [];

    for (let i = 0; i < shipLength; i++) {
        let blockId;
        if (isHorizontal) {
            blockId = targetId + i;
        } else {
            blockId = targetId + i * width;
        }

        if (blockId >= 0 && blockId < width * width) {
            shipPreviewBlocks.push(blockId);
        }
    }


    shipPreviewBlocks.forEach(blockId => {
        const blockElement = document.querySelector(`#player div[id='${blockId}']`);
        if (blockElement) {
            blockElement.style.backgroundColor = '';
        }
    });
}

function dragOver(e) {
    e.preventDefault();

    const shipLength = ships[draggedShip.id].lenght;
    const targetId = Number(e.target.id);
    const isHorizontal = angle === 0;
    const shipPreviewBlocks = [];
    const rowStart = Math.floor(targetId / width) * width;
    const rowEnd = rowStart + width - 1;

    for (let i = 0; i < shipLength; i++) {
        let blockId;

        if (isHorizontal) {
            blockId = targetId + i;

            if (blockId > rowEnd) {
                return;
            }
        } else {
            blockId = targetId + i * width;
        }

        if (blockId >= 0 && blockId < width * width) {
            shipPreviewBlocks.push(blockId);
        } else {
            return;
        }

        const blockElement = document.querySelector(`#player div[id='${blockId}']`);
        if (blockElement && blockElement.classList.contains('player-taken')) {
            return;
        }
    }

    shipPreviewBlocks.forEach(blockId => {
        const blockElement = document.querySelector(`#player div[id='${blockId}']`);
        if (blockElement) {
            blockElement.style.backgroundColor = 'blue';
        }
    });
}

function dropShip(e) {
    console.log('drop')
    const startId = e.target.id;
    const ship = ships[draggedShip.id];

    addPlayerPiece(ship, startId);

    randomBtn.removeEventListener('click', randomShips)
    randomBtn.id = ''
    flipBtn.classList.add('disabled-btn')
    randomBtn.classList.add('disabled-btn')

    if (!notDropped) {
        draggedShip.remove();
    }

    document.querySelectorAll('#player .block').forEach(block => {
        block.style.backgroundColor = '';
    });
}

// Début du jeu

// Bouton de démarrage
const startBtn = document.querySelector('#start_button');
const turnDisplay = document.querySelector('#turn-display');
const infoDisplay = document.querySelector('#info');

function disableBtn() {
    startBtn.removeEventListener('click', startGame)
    flipBtn.removeEventListener('click', flipShip)
    randomBtn.removeEventListener('click', randomShips)

    startBtn.id = ''
    flipBtn.id = ''
    randomBtn.id = ''

    startBtn.classList.add('disabled-btn')
    flipBtn.classList.add('disabled-btn')
    randomBtn.classList.add('disabled-btn')
}

startBtn.addEventListener('click', startGame)

// Fonction pour commencer la partie
function startGame() {
    const playerShips = document.querySelector('.option__container').children.length;

    disableBtn()

    if (playerShips > 0) {
        alert("Please place all your ships")
        return;
    }

    playTurn();
}

// Fonction pour initialiser le tour du joueur
function playTurn() {
    turnDisplay.innerHTML = "Your turn";
    infoDisplay.innerHTML = "Choose a block to attack";
    document.querySelectorAll('#computer .block').forEach(block => {
        block.addEventListener('click', playerAttack);
    });
}

// Fonction pour jouer le coup du joueur
function playerAttack(e) {
    const block = e.target;
    if (block.classList.contains('hit') || block.classList.contains('miss')) {
        playTurn();
        return;
    }

    if (block.classList.contains('taken')) {
        block.classList.add('hit');
        if (!checkWinner()) {
            const shipHit = block.classList[1];
            if (checkKill('computer', shipHit)) {
                document.querySelectorAll('#computer .block').forEach(block => {
                    block.removeEventListener('click', playerAttack);
                });
                addRollAnimation('player');

            } else {
                playTurn();
            }
        };

    } else {

        console.log('miss')
        block.classList.add('miss');

        document.querySelectorAll('#computer .block').forEach(block => {
            block.removeEventListener('click', playerAttack);
        });

        if (doubleTurn) {
            doubleTurn = false;
            playTurn();
        } else {
            turnDisplay.innerHTML = "Computer's turn";
            infoDisplay.innerHTML = "Computer is attacking";

            setTimeout(computerAttack, 1000);
        }
    }
}

// Fonction pour l'attaque de l'ordinateur
function computerAttack(possibleBlock) {
    const allPlayerBlocks = document.querySelectorAll('#player .block');
    let block;
    let randomIndex;

    if (possibleBlock === undefined || possibleBlock.length === 0) {
        randomIndex = Math.floor(Math.random() * allPlayerBlocks.length);
        block = allPlayerBlocks[randomIndex];
        if (block.classList.contains('hit') || block.classList.contains('miss')) {
            computerAttack();
            return;
        }
    } else {
        randomIndex = Math.floor(Math.random() * possibleBlock.length);
        block = allPlayerBlocks[possibleBlock[randomIndex]];
    }

    if (block.classList.contains('player-taken')) {
        block.classList.add('hit');
        if (!checkWinner()) {
            const shipHit = block.classList[1];
            if (checkKill('player', shipHit)) {
                addRollAnimation('computer');
            } else {
                let blockId = Number(block.id);
                let newPossibleBlock = [blockId - 1, blockId + 1, blockId - 10, blockId + 10];

                newPossibleBlock = allInBoard(newPossibleBlock, width);
                newPossibleBlock = notAlreadyHit(newPossibleBlock);

                setTimeout(() => computerAttack(newPossibleBlock), 1000);
            }
        };

    } else {
        block.classList.add('miss');

        if (doubleTurnComputer) {
            console.log('double turn computer')
            doubleTurnComputer = false;
            computerAttack();
        } else {
            setTimeout(playTurn, 1000);
        }
    }
}

// Fonction pour vérifier le gagnant
function checkWinner() {
    const allPlayerHits = document.querySelectorAll('#computer .hit');
    const allComputerHits = document.querySelectorAll('#player .hit');
    console.log(allPlayerHits.length)
    console.log(allComputerHits.length)
    if (allPlayerHits.length === 17) {
        turnDisplay.innerHTML = "You win!";
        infoDisplay.innerHTML = "Congratulations!";
        document.querySelectorAll('#computer .block').forEach(block => {
            block.removeEventListener('click', playerAttack);
        });
        console.log("Partie terminée")
        return true;
    } else if (allComputerHits.length === 17) {
        turnDisplay.innerHTML = "Computer wins!";
        infoDisplay.innerHTML = "Better luck next time!";
        document.querySelectorAll('#computer .block').forEach(block => {
            block.removeEventListener('click', playerAttack);
        });
        console.log("Partie terminée")
        return true;
    }
    console.log("Partie non terminée")
    return false;
}

// Fonction pour garder la uniquement la ligne majoritaire
function keepMajorityInSameRow(blockList) {
    if (blockList.length === 0) return [];

    let tensCount = {};

    blockList.forEach(block => {
        let tens = Math.floor(block / 10);
        if (tensCount[tens]) {
            tensCount[tens]++;
        } else {
            tensCount[tens] = 1;
        }
    });

    let majorityTens = Object.keys(tensCount).reduce((a, b) => tensCount[a] > tensCount[b] ? a : b);

    let majorityBlocks = blockList.filter(block => Math.floor(block / 10) == majorityTens);

    majorityBlocks.sort((a, b) => a - b);

    return majorityBlocks;
}

// Fonction pour lancer un dé et définir le bonus
function rollDice(user, id) {
    const bonus = [radar, fiveBlockHit, doubleTurn2, randomHits, selfHit, passTurn];
    const randomBonus = bonus[id];
    randomBonus(user);
}

// Bonus radar (3x3 qui montre le nombre de cibles)
function radar(user) {
    let allBlocks;

    //Liste de tous les blocs selon le board visé
    if (user === 'player') {
        allBlocks = document.querySelectorAll('#computer .block');
        allBlocks.forEach(block => {
            block.addEventListener('click', radarAttack);
        });
    } else {
        allBlocks = document.querySelectorAll(`#player .block`);
    }

    // Effet hover

    function onMouseOver(event) {
        const targetId = parseInt(event.target.id);
        let row1 = [targetId - 11, targetId - 10, targetId - 9];
        let row2 = [targetId - 1, targetId, targetId + 1];
        let row3 = [targetId + 9, targetId + 10, targetId + 11];

        row1 = keepMajorityInSameRow(row1);
        row2 = keepMajorityInSameRow(row2);
        row3 = keepMajorityInSameRow(row3);

        row1 = allInBoard(row1, width);
        row2 = allInBoard(row2, width);
        row3 = allInBoard(row3, width);

        // Créer la liste finale des blocs touchés
        let radarTarget = [...row1, ...row2, ...row3];

        radarTarget.forEach(target => {
            const targetBlock = document.querySelector(`#computer .block[id='${target}']`);
            targetBlock.style.backgroundColor = 'yellow';
            targetBlock.style.opacity = '0.4';
        });
    }

    function onMouseOut(event) {
        const targetId = parseInt(event.target.id);
        let row1 = [targetId - 11, targetId - 10, targetId - 9];
        let row2 = [targetId - 1, targetId, targetId + 1];
        let row3 = [targetId + 9, targetId + 10, targetId + 11];
        row1 = keepMajorityInSameRow(row1);
        row2 = keepMajorityInSameRow(row2);
        row3 = keepMajorityInSameRow(row3);

        row1 = allInBoard(row1, width);
        row2 = allInBoard(row2, width);
        row3 = allInBoard(row3, width);

        // Créer la liste finale des blocs touchés
        let radarTarget = [...row1, ...row2, ...row3];

        radarTarget.forEach(target => {
            const targetBlock = document.querySelector(`#computer .block[id='${target}']`);
            if (targetBlock.classList.contains('taken') && checkKill('computer', targetBlock.classList[1])) {
                targetBlock.style.backgroundColor = 'red';
            } else {
                targetBlock.style.backgroundColor = '';
            }
            targetBlock.style.opacity = '1';
        });
    }

    // Hover pour savoir ou placer le radar

    if (user === 'player') {
        allBlocks.forEach(block => {
            block.addEventListener('mouseover', onMouseOver);
            block.addEventListener('mouseout', onMouseOut);
        });
    }

    // Gérer la pose du radar par le joueur
    function radarAttack(e) {

        // Récupérer le block cliqué

        const block = e.target;

        // Générer les blocs possibles pour le radar
        let blockId = parseInt(block.id);
        let row1 = [
            blockId - 11, blockId - 10, blockId - 9,
        ];
        let row2 = [
            blockId - 1, blockId, blockId + 1,
        ];
        let row3 = [
            blockId + 9, blockId + 10, blockId + 11,
        ];

        // Trier les blocs réellement touchés
        row1 = keepMajorityInSameRow(row1);
        row2 = keepMajorityInSameRow(row2);
        row3 = keepMajorityInSameRow(row3);

        row1 = allInBoard(row1, width);
        row2 = allInBoard(row2, width);
        row3 = allInBoard(row3, width);

        // Créer la liste finale des blocs touchés
        let radarTarget = [...row1, ...row2, ...row3];


        if (user === 'player') {

            // Enlever les événements hover


            allBlocks.forEach(block => {
                block.removeEventListener('click', radarAttack);
                block.removeEventListener('mouseover', onMouseOver);
                block.removeEventListener('mouseout', onMouseOut);
            });
            let compteur = 0;

            radarTarget.forEach(target => {
                const targetBlock = document.querySelector(`#computer .block[id='${target}']`);
                if (targetBlock.classList.contains('taken')) {
                    compteur++;
                }

                targetBlock.style.backgroundColor = 'yellow';

            });
            optionContainer.innerHTML = '';
            const numberTarget = document.createElement('h1')
            numberTarget.innerHTML = compteur + ' cibles detectees';
            numberTarget.classList.add('number-target')
            optionContainer.append(numberTarget)
            playTurn();

        } else if (user === 'computer') {
            let compteurOrdinateur = 0;
            radarTarget.forEach(target => {
                const targetBlock = document.querySelector(`#player .block[id='${target}']`);
                if (block.classList.contains('player-taken')) {
                    compteurOrdinateur++;
                }

                targetBlock.style.backgroundColor = 'yellow';
                targetBlock.style.opacity = '0.4';
            });
            optionContainer.innerHTML = '';
            const numberTarget = document.createElement('h1')
            numberTarget.innerHTML = compteurOrdinateur + ' cibles detectees';
            numberTarget.classList.add('number-target')
            optionContainer.append(numberTarget)
            computerAttack();
        }
    }

    // Gérer la pose du radar par l'ordinateur
    if (user === 'computer') {
        let randomIndex = Math.floor(Math.random() * allBlocks.length);
        radarAttack({
            target: allBlocks[randomIndex],
        });
    }
}

// Bonus missile (3 blocs touchés aléatoirement)
function randomHits(user) {
    let allUserBlocks;
    if (user === 'player') {
        allUserBlocks = document.querySelectorAll('#computer .block');
    } else {
        allUserBlocks = document.querySelectorAll(`#player .block`);
    }

    let hitBlocks = []

    while (hitBlocks.length < 3) {
        let randomIndex = Math.floor(Math.random() * allUserBlocks.length);
        let block = allUserBlocks[randomIndex];
        if (!block.classList.contains('miss') && !block.classList.contains('hit') && !hitBlocks.includes(block)) {
            hitBlocks.push(block)
        }
    }

    if (user === 'player') {
        hitBlocks.forEach(block => {
            if (block.classList.contains('taken'))
                block.classList.add('hit');
            else {
                block.classList.add('miss');
            }
        })
    } else {
        hitBlocks.forEach(block => {
            if (block.classList.contains('player-taken'))
                block.classList.add('hit');
            else {
                block.classList.add('miss');
            }
        })
    }

    if (user === 'player') {
        playTurn();
    } else {
        setTimeout(computerAttack(), 1000);
    }
}

// Malus auto-hit (3 blocs touchés aléatoirement)
function selfHit(user) {
    const allUserBlocks = document.querySelectorAll(`#${user} .block`);

    let hitBlocks = []

    while (hitBlocks.length < 3) {
        let randomIndex = Math.floor(Math.random() * allUserBlocks.length);
        let block = allUserBlocks[randomIndex];
        console.log(block)
        console.log(randomIndex)
        if (!block.classList.contains('miss') && !block.classList.contains('hit') && !hitBlocks.includes(block)) {
            hitBlocks.push(block)
        }
    }

    hitBlocks.forEach(block => {
        if (user === "player") {
            if (block.classList.contains('player-taken'))
                block.classList.add('hit');
            else {
                block.classList.add('miss');
            }
        } else {
            if (block.classList.contains('taken'))
                block.classList.add('hit');
            else {
                block.classList.add('miss');
            }
        }
    })

    if (user === 'player') {
        setTimeout(computerAttack(), 1000);
    } else {
        playTurn();
    }
}

// Malus passer son tour
function passTurn(user) {
    if (user === 'player') {
        setTimeout(computerAttack(), 2000);
    } else {
        playTurn();
    }
}

// Bonus coup de 5 blocs
function fiveBlockHit(user) {
    let allBlocks;
    if (user === 'player') {
        allBlocks = document.querySelectorAll('#computer .block');
        allBlocks.forEach(block => {
            block.addEventListener('click', fiveBlocksAttack);
        });
    } else {
        allBlocks = document.querySelectorAll(`#player .block`);
    }

    // Effet hover

    function onMouseOver(event) {
        const targetId = parseInt(event.target.id);
        let row1 = [targetId - 10];
        let row2 = [targetId - 1, targetId, targetId + 1];
        let row3 = [targetId + 10];

        row1 = allInBoard(row1, width);
        row2 = allInBoard(row2, width);
        row3 = allInBoard(row3, width);

        // Créer la liste finale des blocs touchés
        let fiveHitTarget = [...row1, ...row2, ...row3];

        fiveHitTarget.forEach(target => {
            const targetBlock = document.querySelector(`#computer .block[id='${target}']`);
            targetBlock.style.backgroundColor = 'red';
            targetBlock.style.opacity = '0.4';
        });
    }

    function onMouseOut(event) {
        const targetId = parseInt(event.target.id);

        let row1 = [targetId - 10];
        let row2 = [targetId - 1, targetId, targetId + 1];
        let row3 = [targetId + 10];

        row1 = allInBoard(row1, width);
        row2 = allInBoard(row2, width);
        row3 = allInBoard(row3, width);

        // Créer la liste finale des blocs touchés
        let radarTarget = [...row1, ...row2, ...row3];

        radarTarget.forEach(target => {
            const targetBlock = document.querySelector(`#computer .block[id='${target}']`);
            if (targetBlock.classList.contains('taken') && checkKill('computer', targetBlock.classList[1])) {
                targetBlock.style.backgroundColor = 'red';
            } else {
                targetBlock.style.backgroundColor = '';
            }
            targetBlock.style.opacity = '1';
        });
    }


    // Hover pour savoir ou placer le radar

    if (user === 'player') {
        allBlocks.forEach(block => {
            block.addEventListener('mouseover', onMouseOver);
            block.addEventListener('mouseout', onMouseOut);
        });
    }

    function fiveBlocksAttack(e) {

        // Récupérer le block cliqué

        const block = e.target;

        // Générer les blocs possibles pour le radar
        let blockId = parseInt(block.id);
        let row1 = [blockId - 10];
        let row2 = [blockId - 1, blockId, blockId + 1];
        let row3 = [blockId + 10];

        row1 = allInBoard(row1, width);
        row2 = allInBoard(row2, width);
        row3 = allInBoard(row3, width);

        // Créer la liste finale des blocs touchés
        let fiveHitTarge = [...row1, ...row2, ...row3];


        if (user === 'player') {

            // Enlever les événements hover


            allBlocks.forEach(block => {
                block.removeEventListener('click', fiveBlocksAttack);
                block.removeEventListener('mouseover', onMouseOver);
                block.removeEventListener('mouseout', onMouseOut);
            });

            let hit = 0;
            let killedShip = false;

            fiveHitTarge.forEach(target => {
                const targetBlock = document.querySelector(`#computer .block[id='${target}']`);
                if (targetBlock.classList.contains('taken') && !targetBlock.classList.contains('hit')) {
                    targetBlock.classList.add('hit');
                    targetBlock.style.backgroundColor = '';
                    targetBlock.style.opacity = '1';

                    const shipHit = targetBlock.classList[1];
                    if (checkKill('computer', shipHit)) {
                        document.querySelectorAll('#computer .block').forEach(block => {
                            block.removeEventListener('click', playerAttack);
                        });

                        killedShip = true;
                    }

                    hit++;

                } else {
                    if (targetBlock.classList.contains('hit')) {
                        targetBlock.style.backgroundColor = '';
                        targetBlock.style.opacity = '1';
                    } else {
                        targetBlock.classList.add('miss');
                        targetBlock.style.backgroundColor = '';
                        targetBlock.style.opacity = '1';
                    }
                }
            });

            if (hit) {
                if (killedShip) {
                    addRollAnimation('player');
                } else {
                    playTurn();
                }
            } else {
                computerAttack();
            }

        } else if (user === 'computer') {

            let hit = 0;
            let killedShip = false;

            fiveHitTarge.forEach(target => {
                const targetBlock = document.querySelector(`#player .block[id='${target}']`);
                if (targetBlock.classList.contains('player-taken')) {
                    targetBlock.classList.add('hit');
                    targetBlock.style.backgroundColor = '';
                    targetBlock.style.opacity = '1';

                    const shipHit = targetBlock.classList[1];
                    if (checkKill('player', shipHit)) {
                        killedShip = true;
                    }

                    hit++;

                } else {
                    targetBlock.classList.add('miss');
                    targetBlock.style.backgroundColor = '';
                    targetBlock.style.opacity = '1';
                }
            });

            if (hit) {
                if (killedShip) {
                    addRollAnimation('computer');
                } else {
                    computerAttack();
                }
            } else {
                playTurn();
            }

        }
    }

    if (user === 'computer') {
        let randomIndex = Math.floor(Math.random() * allBlocks.length);
        fiveBlocksAttack({
            target: allBlocks[randomIndex],
        });
    }
}

// Bonus double tour
function doubleTurn2(user) {
    if (user === 'player') {
        doubleTurn = true;
        playTurn();
    } else {
        doubleTurnComputer = true;
        computerAttack();
    }
}

function addRollAnimation(user) {
    optionContainer.innerHTML = ''; // Réinitialisation du conteneur d'options

    // Création des éléments Swiper
    const swiperContainer = document.createElement('div');
    swiperContainer.classList.add('swiper');

    const swiperWrapper = document.createElement('div');
    swiperWrapper.classList.add('swiper-wrapper');

    // Création des slides
    const slidesData = [
        { id: 0, text: 'Radar' },
        { id: 1, text: 'Coup 5 cases' },
        { id: 2, text: 'Double tour' },
        { id: 3, text: '3 coups aléatoires alliés' },
        { id: 4, text: '3 coups aléatoires ennemis' },
        { id: 5, text: 'Passer tour' }
    ];

    slidesData.forEach(slide => {
        const slideElement = document.createElement('div');
        slideElement.classList.add('swiper-slide');
        slideElement.id = slide.id;
        slideElement.textContent = slide.text;
        swiperWrapper.appendChild(slideElement);
    });

    swiperContainer.appendChild(swiperWrapper);
    optionContainer.appendChild(swiperContainer);

    console.log('Ajouté swiper');

    const totalSlides = slidesData.length; // Nombre total de slides

    // Calcul du délai aléatoire ajusté
    let randomFrame = Math.floor(Math.random() * (totalSlides * 500)) + 2500;

    // Initialisation de Swiper
    const mySwiper = new Swiper('.swiper', {
        autoplay: {
            delay: 0,
            disableOnInteraction: false,
        },
        speed: 200,
        loop: true,
    });

    // Arrêt de l'autoplay après le délai calculé
    setTimeout(() => {
        mySwiper.autoplay.stop();

        // Calcul de l'index actif avec correction pour éviter les dépassements
        const activeIndex = mySwiper.activeIndex % totalSlides;
        const activeSlide = mySwiper.slides[activeIndex];

        // Lancer la fonction rollDice avec l'utilisateur et l'ID du slide actif
        rollDice(user, activeSlide.id);

    }, randomFrame);
}

