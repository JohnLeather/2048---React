import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// ------------------------------------------------------------
// The game...
// ------------------------------------------------------------
const BOARD_GRID_X = 4;
const BOARD_GRID_Y = 4;
const BOARD_MAX_GRID = BOARD_GRID_X * BOARD_GRID_Y;
const EMPTY_CELL = null;
const CELL_WIDTH = 100;
const CELL_PADDING = 8;
const DO_NOT_CHANGE_CELL_INDEX = -1;
// ------------------------------------------------------------
//
//
// 
// ------------------------------------------------------------
  
class Button extends React.Component {
  render() {
    return <div className="button" onClick={this.props.click}>{this.props.title}</div>;
  }
}
// ------------------------------------------------------------
//
//
// 
// ------------------------------------------------------------
class Tile extends React.Component {
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  render() {
    const value = this.props.value;
    const style = this.props.style;
    const reference = this.props.reference;
    
    return <div className={"tile tile-" + value} style={style} ref={reference}>{value}</div>;
  }
}
// ------------------------------------------------------------
// 
//
//
// ------------------------------------------------------------
class Game extends React.Component {
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  constructor(props) {
    super(props);

    this.state = {
      cells: Array(BOARD_MAX_GRID).fill(EMPTY_CELL),
      score : 0,
      highScore : 0,
    };
    this.animationFrame = 1;
  }
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  componentDidMount() {
    this.addKeydownEvent();
    this.startGame();
  }
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  addKeydownEvent() {
    window.addEventListener("keydown", (e) => {this.handleKeyDown(e)});
  }
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  handleKeyDown(e) {
    if (this.animationFrame !== 1) {
      e.preventDefault();
      return;
    }

    switch (e.code) {
      case "ArrowUp":
        this.moveTilesUp();
        e.preventDefault();
        break;

      case "ArrowDown":
        this.moveTilesDown();
        e.preventDefault();
        break;
  
      case "ArrowLeft":
        this.moveTilesLeft();
        e.preventDefault();
        break;

      case "ArrowRight":
        this.moveTilesRight();
        e.preventDefault();
        break;
      
      default:
      }
  }
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
resetCellAnimationInfo(cells) {
  for (let c = 0; c < BOARD_MAX_GRID; c++) {
    let cellInfo = cells[c];
    if (cellInfo !== EMPTY_CELL) {
      cellInfo.onAnimationComplete.increaseValue = false;
      cellInfo.onAnimationComplete.newCellIndex = DO_NOT_CHANGE_CELL_INDEX;
    }
  }
}
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  moveTilesUp() {
    const base = 0;
    const baseAdd = 1;
    const loop = BOARD_GRID_X;
    const nextCell = BOARD_GRID_X;
    
    this.moveTiles(base, baseAdd, loop, nextCell);
  }
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
moveTilesDown() {
  const base = BOARD_MAX_GRID - 1;
  const baseAdd = -1;
  const loop = BOARD_GRID_Y;
  const nextCell = -BOARD_GRID_X;
  
  this.moveTiles(base, baseAdd, loop, nextCell);

}
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
moveTilesLeft() {
  const base = 0;
  const baseAdd = BOARD_GRID_X;
  const loop = BOARD_GRID_Y;
  const nextCell = 1;
  
  this.moveTiles(base, baseAdd, loop, nextCell);
}
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
moveTilesRight() {
  const base = BOARD_GRID_X - 1;
  const baseAdd = BOARD_GRID_X;
  const loop = BOARD_GRID_Y;
  const nextCell = -1;

  this.moveTiles(base, baseAdd, loop, nextCell);
}
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
moveTiles(base, baseAdd, loop, nextShiftedCell) {
  let cells = this.state.cells.slice();
  this.resetCellAnimationInfo(cells);
  
  let newCells = Array(BOARD_MAX_GRID).fill(EMPTY_CELL);

  for (let c = 0; c < loop; c++) {

    let cellA = base + (baseAdd * c);
    let cellB = cellA;

    for (var y = 0; y < BOARD_GRID_Y; y++) {
      let isCellAEmpty = newCells[cellA] === EMPTY_CELL;
      let isCellBEmpty = cells[cellB] === EMPTY_CELL;

      if (!isCellBEmpty) {
        if (isCellAEmpty) {
          newCells[cellA] = cells[cellB];
          cells[cellB].onAnimationComplete.newCellIndex = cellA;
          this.tileSourceDestination(cells[cellB], cellB, cellA);
        }
        else {
          const doMerge = newCells[cellA].value === cells[cellB].value;
          if (doMerge) {
            this.tileSourceDestination(cells[cellB], cellB, cellA);
            newCells[cellA].onAnimationComplete.increaseValue = true;
            cells[cellB].onAnimationComplete.removeTile = true;
            cellA += nextShiftedCell;
          }
          else {
            cellA += nextShiftedCell;
            newCells[cellA] = cells[cellB];
            cells[cellB].onAnimationComplete.newCellIndex = cellA;
            this.tileSourceDestination(cells[cellB], cellB, cellA);
          }
        }
      }
      cellB += nextShiftedCell;
    }
  }

  //
  // Animate only if moves were possible
  //
  for (var i = 0; i < BOARD_MAX_GRID; i++) {
    if (cells[i] !== newCells[i]) {
      this.setState({cells: cells}, () => {
        this.startTileSlidingAnimation();
      });
      break;
    }
  }
}
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
tileSourceDestination(tileInfo, cellSource, cellDestination) {
  {
    const xy = this.getCellPosition(cellSource);
  
    tileInfo.xPos = xy.x;
    tileInfo.yPos = xy.y;
  }

  {
    const xy = this.getCellPosition(cellDestination);
  
    tileInfo.targetX = xy.x;
    tileInfo.targetY = xy.y;
  }
}
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
tileSourceAndDestination(tileInfo, cell) {
  let xy = this.getCellPosition(cell);
  
  tileInfo.xPos = xy.x;
  tileInfo.yPos = xy.y;
  tileInfo.targetX = xy.x;
  tileInfo.targetY = xy.y;
}
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
startTileSlidingAnimation() {
  this.animationFrame = 0;
  window.requestAnimationFrame(this.handleAnimationFrame.bind(this));
}
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
handleAnimationFrame(e) {
  this.animationFrame += (1 - this.animationFrame) / 3;
  if (1 - this.animationFrame <= 0.05) {
    this.animationFrame = 1;
    this.endTileSlidingAnimation();
  }
  else {
    let cells = this.state.cells.slice();
    for (var c = 0; c < BOARD_MAX_GRID; c++) {
      let cellInfo = cells[c];
      if (cellInfo !== EMPTY_CELL) {
        if (cellInfo.targetX !== cellInfo.xPos || cellInfo.targetY !== cellInfo.yPos) {
          cellInfo.xPos += (cellInfo.targetX - cellInfo.xPos) / 4;
          cellInfo.yPos += (cellInfo.targetY - cellInfo.yPos) / 4;
        }
      }
    }
    this.setState({cells: cells});
      
    window.requestAnimationFrame(this.handleAnimationFrame.bind(this));
  }
}
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
endTileSlidingAnimation() {
  let cells = this.state.cells.slice();
  let newCells = Array(BOARD_MAX_GRID).fill(EMPTY_CELL);
  let increaseScoreBy = 0;

  for (var c = 0; c < BOARD_MAX_GRID; c++) {
    let cellInfo = cells[c];
    if (cellInfo !== EMPTY_CELL) {
      
      if (cellInfo.onAnimationComplete.increaseValue) {
        cellInfo.value *= 2;
        increaseScoreBy += cellInfo.value;
      }

      const newCellIndex = cellInfo.onAnimationComplete.newCellIndex;
      
      if (newCellIndex !== c && newCellIndex !== DO_NOT_CHANGE_CELL_INDEX) {
        newCells[newCellIndex] = cells[c];
        this.tileSourceAndDestination(newCells[newCellIndex], newCellIndex);
      }
      else if (!cellInfo.onAnimationComplete.removeTile) {
        newCells[c] = cells[c];
        this.tileSourceAndDestination(newCells[c], c);
      }
      else {
        this.tileSourceAndDestination(cells[c], c);
      }
    }
  }
  
  this.setState({cells: newCells, score : this.state.score + increaseScoreBy}, () => {this.addSingleTile()});
}
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  renderCell(i, ref) {
      return <div className="cell" ref={ref} id={"cell-" + i}></div>;
  }
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  startGame() {
    let highScore = this.state.highScore;
    if (this.state.score > highScore) {
      highScore = this.state.score;
    }
    this.setState({
      score : 0, 
      highScore : highScore, 
      cells: Array(BOARD_MAX_GRID).fill(EMPTY_CELL)
    }, this.addTwoTiles.bind(this));
  }
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  findFreeCell(cells) {
    let cell;

    do {
      cell = Math.floor(Math.random() * BOARD_MAX_GRID);
    } while (cells[cell] !== EMPTY_CELL);

    return cell;
  }
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  addTwoTiles() {
    let cells = this.state.cells.slice();
    
      this.createNewTile(cells);
      this.createNewTile(cells);

      this.setState({cells: cells}, () => {this.startTileScaleAnimation()});
  }
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  addSingleTile() {
    let cells = this.state.cells.slice();
  
    this.createNewTile(cells);

    this.setState({cells: cells}, () => {this.startTileScaleAnimation()});
}
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
startTileScaleAnimation() {
  this.animationFrame = 0;
  window.requestAnimationFrame(() => this.handleTileScaleAnimation());
}
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
handleTileScaleAnimation() {
  let cells = this.state.cells.slice();
  
  this.animationFrame += (1 - this.animationFrame) / 3;
  if (1 - this.animationFrame <= 0.05) {
    this.animationFrame = 1;
  }

  for (let i = 0; i < BOARD_MAX_GRID; i++) {
    let tileInfo = this.state.cells[i];
    if (tileInfo !== EMPTY_CELL) {
      if (tileInfo.scale !== 1) {
        tileInfo.scale = this.animationFrame;
      }
    }
  }

  this.setState({cells: cells});
  if (this.animationFrame !== 1) {
    window.requestAnimationFrame(() => this.handleTileScaleAnimation());
  }
}
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  createNewTile(cells) {
    let newTileCell = this.findFreeCell(cells);
    let xy = this.getCellPosition(newTileCell);

    let tileInfo = {
      value : 2,
      xPos : xy.x,
      yPos : xy.y,
      targetX : xy.x,
      targetY : xy.y,
      ref : React.createRef(),
      scale : 0,
      onAnimationComplete : {
        removeTile : false,
        increaseValue : false,
        newCellIndex : DO_NOT_CHANGE_CELL_INDEX,
      },
    };

    cells[newTileCell] = tileInfo;
  }
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  indexToCellX(index) {
    return index % BOARD_GRID_X;
  }
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  indexToCellY(index) {
    return Math.floor(index / BOARD_GRID_Y);
  }
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  renderTiles() {
    let tiles = [];
    for (let i = 0; i < BOARD_MAX_GRID; i++) {
      let tileInfo = this.state.cells[i];
      if (tileInfo !== EMPTY_CELL) {
        const style = {
          left : tileInfo.xPos + "px", 
          top : tileInfo.yPos + "px", 
          transform : "scale(" + tileInfo.scale + ")",
        };

        tiles.push(<Tile reference={tileInfo.ref} value={tileInfo.value} style={style}/>);
      }
    }
    return tiles;
  }
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  getCellPosition(cellIndex) {
    const cellEl = this.m_cellsRef[cellIndex];
    let bodyRect = document.body.getBoundingClientRect();
    let elemRect = cellEl.current.getBoundingClientRect()
    
    return {x : elemRect.left - bodyRect.left + CELL_PADDING + 4, y : elemRect.top - bodyRect.top + CELL_PADDING + 4};
  }
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  getCellIndex(x, y) {
    return x + (y * BOARD_GRID_X);
  }
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  handleResetGame() {
    this.startGame();
  }
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  renderTilePlacementBackground() {
    let cellsRef = [];
    let cellsJSX = [];
    for (let i = 0; i < BOARD_MAX_GRID; i++) {
      const ref = React.createRef();
      cellsJSX.push(this.renderCell(i, ref));
      cellsRef.push(ref);
    }
    this.m_cellsRef = cellsRef;

    return cellsJSX;
  }

// ------------------------------------------------------------
// 
// ------------------------------------------------------------
renderScorePanel() {
  return (<div className="score-container">
    <div className="score">Score: {this.state.score}</div>
    <div className="hi-score">Hi-Score: {this.state.highScore}</div>
  </div>);
}
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
  render() {
    return (
      <div className="game">
        {this.renderScorePanel()}

        <div className="game-board">
          <div className="cell-grid" style={{width: `${BOARD_GRID_X * (CELL_WIDTH + (CELL_PADDING * 2))}px`}}>
              {this.renderTilePlacementBackground()}
              {this.renderTiles()}
          </div> 
        </div>
        <div class="button-container">
          <Button title="Restart" click={() => {this.handleResetGame();}} />
        </div>
      </div>
      );
    }
  }
// ------------------------------------------------------------
// 
// ------------------------------------------------------------
ReactDOM.render(
  <Game />,
  document.getElementById('root')
);