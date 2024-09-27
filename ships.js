// Classe pour les navires
class Ship {
    constructor(name, lenght) {
        this.name = name;
        this.lenght = lenght;
    }
}

// Création des navires

export const destroyer = new Ship('destroyer', 2)
export const submarine = new Ship('submarine', 3)
export const cruiser = new Ship('cruiser', 3)
export const battleship = new Ship('battleship', 4)
export const carrier = new Ship('carrier', 5)


export const ships = [destroyer, submarine, cruiser, battleship, carrier]