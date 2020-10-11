import React, { Component } from "react";

import SphericalBoardVis from "./SphericalBoardVis";
import "./styles.css";

const divisions = 50;

const newBoardStatus = (cellStatus = () => Math.random() < 0.3) => {
  const board = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: []
  };

  for (let face = 0; face < 6; face++) {
    for (let r = 0; r < divisions; r++) {
      board[face][r] = [];
      for (let c = 0; c < divisions; c++) {
        board[face][r][c] = cellStatus();
      }
    }
  }
  return board;
};

const Slider = ({ speed, onSpeedChange }) => {
  const handleChange = (e) => onSpeedChange(e.target.value);

  return (
    <input
      type="range"
      min="1"
      max="200"
      step="10"
      value={speed}
      onChange={handleChange}
    />
  );
};

class App extends Component {
  state = {
    boardStatus: newBoardStatus(),
    generation: 0,
    isGameRunning: false,
    speed: 100
  };

  runStopButton = () => {
    return this.state.isGameRunning ? (
      <button type="button" onClick={this.handleStop}>
        Stop
      </button>
    ) : (
      <button type="button" onClick={this.handleRun}>
        Start
      </button>
    );
  };

  handleClearBoard = () => {
    this.setState({
      boardStatus: newBoardStatus(() => false),
      generation: 0
    });
  };

  handleNewBoard = () => {
    this.setState({
      boardStatus: newBoardStatus(),
      generation: 0
    });
  };

  handleStep = () => {
    const nextStep = (prevState) => {
      const boardStatus = prevState.boardStatus;

      /* Must deep clone boardStatus to avoid modifying it by reference when updating clonedBoardStatus.
			Can't use `const clonedBoardStatus = [...boardStatus]`
			because Spread syntax effectively goes one level deep while copying an array. 
			Therefore, it may be unsuitable for copying multidimensional arrays.
			Note: JSON.parse(JSON.stringify(obj)) doesn't work if the cloned object uses functions */
      const clonedBoardStatus = JSON.parse(JSON.stringify(boardStatus));

      const amountTrueNeighbors = (face, r, c) => {
        const faceNeighbours = [
          [1, 4, 3, 5], //0
          [2, 4, 0, 5], //1
          [3, 4, 1, 5], //2
          [0, 4, 2, 5], //3
          [1, 2, 3, 0], //4
          [1, 0, 3, 2] //5
        ];
        const neighbors = [
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, 1],
          [1, 1],
          [1, 0],
          [1, -1],
          [0, -1]
        ];
        return neighbors.reduce((trueNeighbors, neighbor) => {
          var x = r + neighbor[0];
          var y = c + neighbor[1];
          const isNeighborOnFace =
            x >= 0 && x < divisions && y >= 0 && y < divisions;

          // at corners of each face quads only have 7 (not 8) neighbours
          const onEdge =
            (x < 0 && y < 0) ||
            (x < 0 && y >= divisions) ||
            (x >= divisions && y < 0) ||
            (x >= divisions && y >= divisions);

          if (!isNeighborOnFace && !onEdge) {
            ///on adjacenet face. modify x,y and face
            if (x < 0) {
              face = faceNeighbours[face][0];
              x = divisions - 1;
            } else if (x >= divisions) {
              face = faceNeighbours[face][2];
              x = 0;
            } else if (y < 0) {
              face = faceNeighbours[face][1];
              y = divisions - 1;
            } else if (y >= divisions) {
              face = faceNeighbours[face][3];
              y = 0;
            }
          }

          /* No need to count more than 4 alive neighbors due to rules */
          if (trueNeighbors < 4 && !onEdge && boardStatus[face][x][y]) {
            return trueNeighbors + 1;
          } else {
            return trueNeighbors;
          }
        }, 0);
      };

      for (let face = 0; face < 6; face++) {
        for (let r = 0; r < divisions; r++) {
          for (let c = 0; c < divisions; c++) {
            const totalTrueNeighbors = amountTrueNeighbors(face, r, c);

            if (!boardStatus[face][r][c]) {
              if (totalTrueNeighbors === 3)
                clonedBoardStatus[face][r][c] = true;
            } else {
              if (totalTrueNeighbors < 2 || totalTrueNeighbors > 3)
                clonedBoardStatus[face][r][c] = false;
            }
          }
        }
      }

      return clonedBoardStatus;
    };

    this.setState((prevState) => ({
      boardStatus: nextStep(prevState),
      generation: prevState.generation + 1
    }));
  };

  handleSpeedChange = (newSpeed) => {
    this.setState({ speed: newSpeed });
  };

  handleRun = () => {
    this.setState({ isGameRunning: true });
  };

  handleStop = () => {
    this.setState({ isGameRunning: false });
  };

  componentDidUpdate(prevProps, prevState) {
    const { isGameRunning, speed } = this.state;
    const speedChanged = prevState.speed !== speed;
    const gameStarted = !prevState.isGameRunning && isGameRunning;
    const gameStopped = prevState.isGameRunning && !isGameRunning;

    if ((isGameRunning && speedChanged) || gameStopped) {
      clearInterval(this.timerID);
    }

    if ((isGameRunning && speedChanged) || gameStarted) {
      this.timerID = setInterval(() => {
        this.handleStep();
      }, speed);
    }
  }

  render() {
    const { boardStatus, isGameRunning, generation, speed } = this.state;

    return (
      <div className="App">
        <div className="vis-container">
          <SphericalBoardVis
            divisions={divisions}
            boardStatus={boardStatus}
            onToggleCellStatus={this.handleToggleCellStatus}
          />
        </div>
        <div className="controls">
          <span>
            {"+ "}
            <Slider speed={speed} onSpeedChange={this.handleSpeedChange} />
            {" -"}
          </span>
          {`Generation: ${generation}`}
          {this.runStopButton()}
          <button
            type="button"
            disabled={isGameRunning}
            onClick={this.handleStep}
          >
            Step
          </button>
          <button type="button" onClick={this.handleClearBoard}>
            Clear Board
          </button>
          <button type="button" onClick={this.handleNewBoard}>
            New Board
          </button>
        </div>
      </div>
    );
  }
}

export default App;
