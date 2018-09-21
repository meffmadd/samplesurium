import * as tf from '@tensorflow/tfjs';
import * as p5 from 'p5';
import 'p5/lib/addons/p5.dom';

export const TicTacToe = (p: p5) => {
    let canvas, container;
    const canvasSize = 500;
    const boardSize = 350, tileSize = boardSize / 3;
    const lineW = 10;
    let crossesCol, knottsCol, previewCol;
    let pauseBtn;
    let paused = false;
    //tf.setBackend('cpu');
    //tf.setBackend('webgl');

    let currentBoardState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    let turn = -1; // crosses begins
    const size = 3;
    const KNOTTS = 1;
    const CROSSES = -1;
    const symmetry = ['rotate180', 'rotate90', 'rotate270', 'flip_v', 'flip_h'];
    const GameState = {
        WINX: -1,
        DRAW: 0,
        WINO: 1,
        NONE: 2
    }
    let wins = 0, losses = 0, draws = 0;

    let trainingBoards = [], trainingMoves = [];
    let xs, ys;
    let model, optimizer;
    let learningRate = 0.01;
    let trainingLoss = [], maxLoss = 0, lossesLength = 150;
    let totalExamples = 0;

    p.setup = () => {
        canvas = p.createCanvas(canvasSize, canvasSize);
        p.strokeCap(p.SQUARE);
        p.frameRate(30);
        p.background(255);
        p.textSize(14);
        p.textFont('IBM Plex Mono');
        crossesCol = p.color('#f95602');
        previewCol = p.color(255, 191, 158);
        knottsCol = p.color(30, 38, 70);
        pauseBtn = p.createButton('Pause Training');
        pauseBtn.position(boardSize - 20, canvasSize - 140);
        pauseBtn.mousePressed(() => {
            paused = !paused;
            if (paused) {
                pauseBtn.html("Resume Training");
            } else {
                pauseBtn.html("Pause Training");
            }
        });
        pauseBtn.class('p5-button');
        p.hide();

        getMoves(1200);
        xs = tf.variable(tf.zeros([1200, 9]).cast('int32'));
        ys = tf.variable(tf.zeros([1200, 9]));
        initalizeTrainingTensors();

        model = tf.sequential();
        model.add(
            tf.layers.dense({
                units: 100,
                inputShape: [9],
                activation: 'relu6'
            })
        );

        model.add(
            tf.layers.dense({
                units: 100,
                activation: 'relu6'
            })
        );

        model.add(
            tf.layers.dense({
                units: 9,
                activation: 'sigmoid'
            })
        );

        optimizer = tf.train.adam(learningRate);
        model.compile({
            optimizer: optimizer,
            loss: 'categoricalCrossentropy'
        });

        trainModel();
    }

    function train() {
        return model.fit(xs, ys, {
            batchSize: 50,
            epochs: 3
        });
    }

    async function trainModel() {
        train().then(result => {
            result.history.loss.forEach((e) => {
                trainingLoss.push(e);
                if (trainingLoss.length >= lossesLength) {
                    trainingLoss = trainingLoss.slice(
                        trainingLoss.length - lossesLength, trainingLoss.length
                    );
                }
                if (e > maxLoss) maxLoss = e;
            });
            drawLoss();
            getMoves(1200);
            totalExamples += 1200;
            console.log("The model trained on " + totalExamples + " examples");
            initalizeTrainingTensors();
            //if (!p._loop) tf.disposeVariables();
            if (!paused && p._loop) trainModel();
        });
    }

    function getNextMove(board) {
        let pred = model.predict(tf.tensor2d([board]));
        let move = pred.argMax(1).dataSync()[0];
        if (currentBoardState[move] !== 0) {
            let data = pred.dataSync();
            let sorted = data.slice(0);
            sorted.sort().reverse();
            for (let i = 1; i < currentBoardState.length; i++) {
                move = data.findIndex((e) => e === sorted[i]);
                if (currentBoardState[move] === 0) return move;
            }
        }
        return move;
    }

    p.draw = () => {
        console.log(tf.memory().numBytes);
        drawBoard(currentBoardState);
        p.strokeWeight(2 * lineW);
        let i = Math.floor(p.mouseX / tileSize);
        let j = Math.floor(p.mouseY / tileSize);
        if (i >= 0 && i < 3 && j >= 0 && j < 3 && currentBoardState[j * 3 + i] === 0) {
            p.stroke(previewCol);
            drawCrosses(i, j);
        }
        drawInformation();

        if (turn === KNOTTS) { // AI
            setTimeout(null, 500);
            let move;
            tf.tidy(() => {
                move = getNextMove(currentBoardState);
            });

            console.log("AI move: " + move);
            currentBoardState[move] = KNOTTS;
            turn *= -1;
            evaluateGame();
        }
    }

    p.mousePressed = () => {
        // board in top left corner:
        let x = p.mouseX, y = p.mouseY;
        if (turn === KNOTTS || x < 0 || x > boardSize || y < 0 || y > boardSize) return;

        let i = Math.floor(y / tileSize);
        let j = Math.floor(x / tileSize);
        let move = i * 3 + j;
        if (currentBoardState[move] !== 0) return;
        console.log("Your move: " + move);
        currentBoardState[move] = CROSSES;
        turn *= -1;
        evaluateGame();
    }

    function evaluateGame() {
        let state = getGameState();

        if (state === GameState.WINX) {
            console.log("You win");
            console.log("Winning board was: " + currentBoardState);
            wins++;
            clearBoard();
            turn = -1;
        } else if (state === GameState.WINO) {
            console.log("AI wins");
            losses++;
            clearBoard();
            turn = -1;
        } else if (state === GameState.DRAW) {
            console.log("Draw");
            draws++;
            clearBoard();
            turn = -1;
        }
    }

    function getGameState() {
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                let pos = y * 3 + x;
                let state = tileState(true, x, y, null, null, 0, currentBoardState[pos]);
                if (state === GameState.WINX || state === GameState.WINO) return state;
            }
        }
        if (currentBoardState.reduce((acc, e) => acc && e !== 0, true)) return GameState.DRAW;
        return GameState.NONE;
    }

    /**
     * 
     * @param {boolean} isStart true if recursion should start, false if direction is to be evaluated
     * @param {number} x x-coordiante to check
     * @param {number} y y-coordinate to check
     * @param {function} vertical evaluation function for y (either decrement or increment)
     * @param {function} horizontal evaluation function for x (either decrement or increment)
     * @param {number} count number of tiles in a row
     * @param {number} player type of tile (knotts or crosses)
     */
    function tileState(isStart = false, x, y, vertical, horizontal, count, player) {
        if (x < 0 || y < 0 || x > 2 || y > 2) return null;
        let pos = y * 3 + x;

        if (currentBoardState[pos] !== player) {
            return null;
        }
        if (count === 3) {
            return currentBoardState[pos];
        }
        if (isStart) {
            return tileState(false, x, y, inc, inc, 1, player)
                || tileState(false, x, y, dec, inc, 1, player)
                || tileState(false, x, y, inc, dec, 1, player)
                || tileState(false, x, y, dec, dec, 1, player)
                || tileState(false, x, y, id, inc, 1, player)
                || tileState(false, x, y, id, dec, 1, player)
                || tileState(false, x, y, inc, id, 1, player)
                || tileState(false, x, y, id, dec, 1, player);
        }

        y = vertical(y);
        x = horizontal(x);

        return tileState(false, x, y, vertical, horizontal, count + 1, player);
    }

    function drawBoard(board) {
        p.noStroke();
        p.fill('white');
        p.rect(0, 0, boardSize, boardSize);
        p.strokeWeight(lineW);
        p.stroke('black');
        p.line(tileSize, lineW, tileSize, boardSize - lineW);
        p.line(2 * tileSize, lineW, 2 * tileSize, boardSize - lineW);
        p.line(lineW, tileSize, boardSize - lineW, tileSize);
        p.line(lineW, 2 * tileSize, boardSize - lineW, 2 * tileSize);
        p.strokeWeight(lineW * 2);
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i * size + j] === KNOTTS) {
                    p.stroke(knottsCol);
                    drawKnotts(j, i);
                }
                else if (board[i * size + j] === CROSSES) {
                    p.stroke(crossesCol);
                    drawCrosses(j, i);
                }
            }
        }
    }

    function drawKnotts(i, j) {
        let x = tileSize * i + tileSize / 2;
        let y = tileSize * j + tileSize / 2;

        p.ellipse(x, y, tileSize * 0.7, tileSize * 0.7);
    }

    function drawCrosses(i, j) {
        let offset = tileSize / 8;
        let x = tileSize * i + offset;
        let y = tileSize * j + offset;

        p.line(x, y, x + tileSize - 2 * offset, y + tileSize - 2 * offset);
        p.line(x + tileSize - 2 * offset, y, x, y + tileSize - 2 * offset);
    }

    function drawLoss() {
        let yStart = boardSize + 35;
        let yEnd = canvasSize - 15;
        let xStart = 55;
        let yDiff = yEnd - yStart;

        p.noStroke();
        p.fill('white');
        p.rect(0, yStart - 5, boardSize, yDiff + 10);
        p.noFill();

        p.stroke(knottsCol);
        p.strokeWeight(2);
        p.line(xStart - 5, yStart, xStart - 5, yEnd);
        p.noStroke();
        p.fill('black');
        p.text('0', xStart - 15, yEnd);
        p.text('Loss', xStart - 40, yStart + 10);
        p.noFill();
        p.stroke(knottsCol);
        p.strokeWeight(3);

        let step = (boardSize - xStart - 20) / lossesLength;
        let currPos = xStart;
        for (let i = 0; i < trainingLoss.length; i++) {
            let y = p.lerp(0, 1, trainingLoss[i] / maxLoss) * yDiff;
            y = yEnd - y;
            p.point(currPos, y);
            currPos += step;
        }
    }

    function drawInformation() {
        let xStart = boardSize + 10;;
        p.noStroke();
        p.fill('white');
        p.rect(xStart, 0, canvasSize - xStart, 200);
        p.fill('black');
        p.text('Wins: ' + wins, xStart, 20);
        p.text('Losses: ' + losses, xStart, 36);
        p.text('Draws: ' + draws, xStart, 52);
    }

    function initalizeTrainingTensors() {
        let n = trainingMoves.length;

        tf.tidy(() => {
            xs.assign(tf.tensor2d(trainingBoards, [n, 9], 'int32'));
            let tfMoves = tf.tensor1d(trainingMoves, 'int32');
            let oneHot = tf.oneHot(tfMoves, 9);
            ys.assign(oneHot.cast('float32')); // cast for loss calculation (output of model is float32)
            tf.dispose(tfMoves);
            tf.dispose(oneHot);
        });
    }


    function getMoves(n) {
        trainingBoards = [];
        trainingMoves = [];
        for (let i = 0; i < n; i++) {
            let response = getRandomMove();
            trainingBoards.push(response.board);
            trainingMoves.push(response.move);
        }
    }

    function getRandomMove() {
        let randomBoard = boards[Math.floor(Math.random() * boards.length)];
        let randomMove = {
            board: randomBoard.slice(0, randomBoard.length - 1),
            move: randomBoard[randomBoard.length - 1]
        };
        let n = (Math.random() < 0.1) ? 1 : 2; // for a chance to just flip_h and flip_v
        for (let i = 0; i < n; i++) {
            let randomTranformation = symmetry[Math.floor(Math.random() * symmetry.length)];
            randomMove = getSymentry(randomMove.board, randomMove.move, randomTranformation);
        }
        return randomMove;
    }

    function getSymentry(board, move, transformation) {
        let response = { board: null, move: null };
        if (transformation === 'rotate180') {
            response.board = board.reverse();
            response.move = 8 - move;
        } else if (transformation === 'rotate90') {
            response.board = rotateBoard90(board);
            response.move = [6, 3, 0, 7, 4, 1, 8, 5, 2].indexOf(move);
        } else if (transformation === 'rotate270') {
            response.board = rotateBoard90(board).reverse();
            response.move = [2, 5, 8, 1, 4, 7, 0, 3, 6].indexOf(move);
        } else if (transformation === 'flip_v') {
            response.board = board.slice(6, 9);
            response.board.push(...board.slice(3, 6));
            response.board.push(...board.slice(0, 3));
            response.move = [6, 7, 8, 3, 4, 5, 0, 1, 2].indexOf(move);
        } else if (transformation === 'flip_h') {
            board.reverse();
            response.board = board.slice(6, 9);
            response.board.push(...board.slice(3, 6));
            response.board.push(...board.slice(0, 3));
            response.move = [2, 1, 0, 5, 4, 3, 8, 7, 6].indexOf(move);
        }

        return response;
    }

    let rotateBoard90 = (board) => {
        let newBoard = [];
        for (let i = 0; i < 3; i++) {
            newBoard.push(board[6 + i]);
            newBoard.push(board[3 + i]);
            newBoard.push(board[i]);
        }
        return newBoard;
    }

    const dec = (n) => --n
    const inc = (n) => ++n;
    const id = (n) => n;
    let clearBoard = () => currentBoardState.fill(0);
    p.hide = () => {
        canvas.style('display', 'none');
        pauseBtn.style('display', 'none');
    }
    p.show = () => {
        canvas.style('display', 'block');
        pauseBtn.style('display', 'inline');
    }
    p.append = () => {
        container = document.getElementById("sketch");
        container.appendChild(canvas.canvas);
        container.appendChild(pauseBtn.elt);
    }
    p.resumeTraining = () => {
        if (!model.isTraining) trainModel();
    }


    const boards = [
        [0, 0, 0, 0, -1, 0, 0, 0, 0, 0],
        [0, -1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, -1, 0, 0, 0, 6],
        [-1, 0, 0, 0, 0, 0, 0, 0, 0, 4],
        [0, 0, 0, 0, 0, 0, 1, -1, -1, 3],
        [0, -1, 0, 0, 1, 0, 0, 0, -1, 0],
        [0, -1, 1, 0, 0, -1, 0, 0, 0, 7],
        [-1, 0, 0, 0, -1, 0, 0, 0, 1, 6],
        [0, 0, 1, 0, 0, -1, -1, 0, 0, 4],
        [0, 0, -1, 0, 0, 0, 0, -1, 1, 4],
        [1, 0, 0, -1, 0, 0, 0, -1, 0, 2],
        [0, 0, -1, 0, 1, 0, -1, 0, 0, 5],
        [-1, 0, 0, 1, -1, -1, 0, 0, 1, 6],
        [-1, 1, -1, 0, 1, 0, 0, 1, 0, 8],
        [0, 0, 0, -1, 0, 1, 1, -1, -1, 1],
        [-1, 1, 0, 0, 0, -1, 0, -1, 1, 3],
        [0, -1, 1, 0, 1, -1, -1, 0, 0, 8],
        [0, 0, -1, 1, 0, -1, 0, -1, 1, 0],
        [1, -1, 0, 0, -1, 0, 0, 0, 0, 7],
        [1, 0, -1, 0, -1, 0, 0, 0, 0, 6],
        [1, 0, 0, 0, -1, 0, -1, 0, 0, 2],
        [1, 0, 0, 0, -1, -1, 0, 0, 0, 3],
        [1, 0, 0, 0, -1, 0, 0, 0, -1, 6],
        [1, -1, 0, -1, -1, 0, 0, 1, 0, 5],
        [1, -1, 0, 0, -1, 0, -1, 1, 0, 2],
        [1, -1, -1, 0, -1, 0, 0, 1, 0, 6],
        [1, -1, 0, 0, -1, -1, 0, 1, 0, 3],
        [1, 0, -1, -1, -1, 0, 1, 0, 0, 8],
        [1, -1, 1, 0, -1, 0, -1, 0, 0, 7],
        [1, 0, 0, 1, -1, -1, -1, 0, 0, 2],
        [1, 0, 0, -1, -1, 0, 1, 0, -1, 5],
        [-1, 0, -1, 0, 1, 0, 0, 0, 0, 1],
        [0, 0, 1, -1, 0, -1, 0, 0, 0, 4],
        [1, 0, 1, -1, 1, -1, -1, 0, -1, 1],
        [-1, 0, 0, 1, 1, 0, -1, 0, -1, 5],
        [0, 0, 1, -1, 1, -1, -1, 0, 0, 0],
        [1, 0, -1, 0, -1, 0, 1, -1, 0, 3],
        [1, 0, 1, 0, -1, -1, 0, 0, -1, 1],
        [1, 0, -1, -1, -1, 0, 1, 0, 0, 5],
        [-1, -1, 0, 0, 1, 0, 0, 0, 0, 2],
        [-1, -1, 1, 0, 1, 0, -1, 0, 0, 3],
        [0, 0, -1, 0, 1, -1, 0, -1, 1, 0],
        [0, 0, -1, 0, 1, -1, -1, 0, 1, 0],
        [1, -1, -1, 1, 0, 0, -1, 0, 0, 4],
        [1, 0, -1, -1, 1, 0, 0, 0, -1, 5],
        [1, 0, 1, -1, 0, -1, 1, -1, 1, 4],
        [-1, 1, -1, -1, 1, 1, 0, -1, 0, 6],
        [0, 0, -1, 0, -1, 0, 1, -1, 1, 1]
    ];
}