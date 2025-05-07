import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  board: ('' | 'S' | 'H' | 'M' | 'P' | 'C')[][] = [];
  playerBoard: ('' | 'S' | 'H' | 'M' | 'P' | 'C')[][] = [];
  aiBoard: ('' | 'S' | 'H' | 'M' | 'C')[][] = [];
  currentPlayer: 'player' | 'ai' = 'player';
  ships: { row: number; col: number; size: number; direction: 'horizontal' | 'vertical' }[] = [];
  availableShips = [
    { size: 1, direction: 'horizontal', color: 'blue' },
    { size: 1, direction: 'horizontal', color: 'green' }
  ];
  draggedShip: any = null;
  playerScore: number = 0;
  aiScore: number = 0;

  constructor() {
    this.initializeBoards();
  }

  initializeBoard(): void {
    this.board = Array(7).fill(null).map(() => Array(7).fill(''));
  }

  initializeBoards(): void {
    this.playerBoard = Array(7).fill(null).map(() => Array(7).fill(''));
    this.aiBoard = Array(7).fill(null).map(() => Array(7).fill(''));
  }

  onCellClick(row: number, col: number): void {
    if (this.currentPlayer === 'player' && this.board[row][col] === '') {
      if (this.board[row][col] === 'S' as ('' | 'S' | 'H' | 'M' | 'P' | 'C')) {
        this.board[row][col] = 'H'; // Mark as hit
        this.updateScore(true); // Update player score on hit
      } else {
        this.board[row][col] = 'M'; // Mark as miss
      }
      this.checkVictory();
      this.switchTurn();
    }
  }

  onPlayerCellClick(row: number, col: number): void {
    if (this.currentPlayer === 'player' && this.aiBoard[row][col] === '') {
      if (this.aiBoard[row][col] === 'C' as ('' | 'S' | 'H' | 'M' | 'C')) {
        this.aiBoard[row][col] = 'H'; // Mark as hit
        this.updateScore(true); // Update player score on hit
      } else {
        this.aiBoard[row][col] = 'M'; // Mark as miss
      }
      this.checkVictory();
      this.switchTurn();
    }
  }

  onAICellClick(row: number, col: number): void {
    if (this.playerBoard[row][col] === 'P') {
      this.playerBoard[row][col] = 'H'; // AI marks a hit
      this.updateScore(false); // Update AI score on hit
    } else {
      this.playerBoard[row][col] = 'M'; // AI marks a miss
    }
  }

  placeShip(row: number, col: number, isPlayer: boolean): void {
    if (isPlayer) {
      if (this.playerBoard[row][col] === '') {
        this.playerBoard[row][col] = 'P'; // Mark the cell as a player ship
      }
    } else {
      if (this.aiBoard[row][col] === '') {
        this.aiBoard[row][col] = 'C'; // Mark the cell as an AI ship
      }
    }
  }

  canPlaceShip(row: number, col: number, size: number, direction: 'horizontal' | 'vertical'): boolean {
    for (let i = 0; i < size; i++) {
      const r = direction === 'horizontal' ? row : row + i;
      const c = direction === 'horizontal' ? col + i : col;
      if (r >= 7 || c >= 7 || this.board[r][c] !== '') {
        return false; // Prevents overlapping or out-of-bounds placement
      }
    }
    return true;
  }

  switchTurn(): void {
    this.currentPlayer = this.currentPlayer === 'player' ? 'ai' : 'player';
    if (this.currentPlayer === 'ai') {
      this.aiTurn();
    }
  }

  aiTurn(): void {
    let row: number;
    let col: number;
    do {
      row = Math.floor(Math.random() * 7);
      col = Math.floor(Math.random() * 7);
    } while (this.playerBoard[row][col] === 'H' || this.playerBoard[row][col] === 'M');

    if (this.playerBoard[row][col] === 'P') {
      this.playerBoard[row][col] = 'H'; // AI marks a hit
      this.updateScore(false); // Update AI score on hit
    } else {
      this.playerBoard[row][col] = 'M'; // AI marks a miss
    }

    // Ensure AI places only one ship per turn
    let aiShipsPlaced = this.aiBoard.flat().filter(cell => cell === 'C').length;
    if (aiShipsPlaced < 2) {
      for (let colIndex = 6; colIndex >= 0; colIndex--) {
        for (let rowIndex = 0; rowIndex <= 6; rowIndex++) {
          if (this.aiBoard[rowIndex][colIndex] === '') {
            this.aiBoard[rowIndex][colIndex] = 'C'; // Place one AI ship
            return; // Exit after placing one ship
          }
        }
      }
    }

    this.switchTurn();
  }

  checkVictory(): void {
    const allShipsSunk = this.ships.every(ship => {
      const { row, col, size, direction } = ship;
      for (let i = 0; i < size; i++) {
        const r = direction === 'horizontal' ? row : row + i;
        const c = direction === 'horizontal' ? col + i : col;
        if (this.board[r][c] !== 'H') {
          return false;
        }
      }
      return true;
    });

    if (allShipsSunk) {
      alert(`${this.currentPlayer === 'player' ? 'AI' : 'Player'} wins!`);
      this.initializeBoard();
    }
  }

  updateScore(isPlayer: boolean): void {
    if (isPlayer) {
      this.playerScore++;
    } else {
      this.aiScore++;
    }
  }

  onDragStart(event: DragEvent, ship: any): void {
    this.draggedShip = ship;
    event.dataTransfer?.setData('text', JSON.stringify(ship));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const data = event.dataTransfer?.getData('text');
    if (data) {
      const ship = JSON.parse(data);
      const target = event.target as HTMLElement;
      const row = parseInt(target.dataset['row'] || '0', 10);
      const col = parseInt(target.dataset['col'] || '0', 10);
      this.placeShip(row, col, true); // Always placing player ships via drag-and-drop
      this.switchTurn(); // Switch to AI's turn after the player places a ship
    }
  }
}
