import * as p5 from 'p5';
import 'p5/lib/addons/p5.dom';
import * as tf from '@tensorflow/tfjs';

export const Classification = (p: p5) => {
    let canvas, container;
    const canvasSize = 500;
    const resolution = 20;
    const size = canvasSize / resolution;
    let positive = [], negative = [], labels = [], xPred = [];
    let positiveCol, negativeCol, midColor;
    let upscaleRes = 80;

    let updated = true;
    let running = true;
    let trainIteration = 0;

    let model, optimizer;
    let xs, ys, xInputs;

    p.setup = () => {
        canvas = p.createCanvas(canvasSize, canvasSize);
        p.frameRate(15);
        positiveCol = p.color('#f95602');
        //negativeCol = color('#5d9eff');
        negativeCol = p.color(30, 38, 70);
        midColor = p.color('white');
        p.strokeWeight(8);
        let nPos = 170;
        let nNeg = 250;
        getPositive(positive, nPos);
        getNegative(negative, nNeg);
        getLabels(labels, nPos + nNeg, nPos);
        getPredictors(xPred);
        positive.push(...negative);
        p.hide();

        xs = tf.tensor2d(positive);
        ys = tf.tensor1d(labels);
        xInputs = tf.tensor2d(xPred);

        model = tf.sequential();
        model.add(
            tf.layers.dense({
                units: 10,
                inputShape: [2],
                activation: 'sigmoid'
            })
        );

        model.add(
            tf.layers.dense({
                units: 1,
                activation: 'sigmoid'
            })
        );

        optimizer = tf.train.adam(0.23);
        model.compile({
            optimizer: optimizer,
            loss: tf.losses.meanSquaredError
        });

        tf.tidy(() => {
            trainModel();
        });

        setTimeout(evaluateFramerate, 3000);
        setTimeout(adjustFrameRate, 4000);
    }

    function train() {
        return model.fit(xs, ys, {
            batchSize: 50,
            epochs: 15
        });
    }

    // fixes memory leak
    async function trainModel() {
        for (; trainIteration < 15; trainIteration++) {
            //sleep(10);
            console.log("Before training: " + tf.memory().numTensors);
            if (p._loop) {
                await train();
            } else {
                break;
            }
            console.log("After training: " + tf.memory().numTensors);
        }
    }


    p.draw = () => {
        if (!updated) return;
        updated = false;
        drawCountour().then(() => {
            updated = true;
        });

        positive.forEach(element => {
            let x = normalizeFrom(element[0], 0, 1);
            let y = normalizeFrom(element[1], 0, 1);
            drawPoint(x, y, positiveCol);

        });

        negative.forEach(element => {
            let x = normalizeFrom(element[0], 0, 1);
            let y = normalizeFrom(element[1], 0, 1);
            drawPoint(x, y, negativeCol);
        });

    }

    async function drawCountour() {
        tf.tidy(() => {
            let yOutputs = model.predict(xInputs);
            const reshaped = yOutputs.reshape([Math.floor(size) + 1, Math.floor(size) + 1, 1]);
            const resized = tf.image.resizeBilinear(reshaped, [upscaleRes, upscaleRes]);
            let yPreds = resized.dataSync();
            let index = 0;
            const predSize = Math.sqrt(yPreds.length);
            const tileSize = canvasSize / predSize;
            p.noStroke();
            for (let i = 0; i < predSize; i++) {
                for (let j = 0; j < predSize; j++) {
                    p.fill(getColor(yPreds[index++]));
                    p.rect(i * tileSize, j * tileSize, tileSize, tileSize);
                }
            }
        });
    }

    // if framerate is reduced, the model trains faster
    function evaluateFramerate() {
        let fps = p.frameRate();
        fps = Math.floor(fps * 0.8);
        if (fps > 10) {
            p.frameRate(fps);
            console.log("Framerate changed to: " + fps);
        }
    }

    async function adjustFrameRate() {
        if (upscaleRes < 30) return;
        let fps = Math.floor(p.frameRate());
        if (fps >= 15) {
            upscaleRes = Math.floor(upscaleRes * 1.3);
            p.frameRate(fps * 0.8);
        } else if (fps < 10) {
            upscaleRes = Math.floor(upscaleRes * 0.8);
        } else {
            setTimeout(adjustFrameRate, 1500);
            return;
        }
        console.log("Upscaling resolution changed to: " + upscaleRes);
        setTimeout(adjustFrameRate, 1500);
    }

    function drawPoint(x, y, col) {
        p.noFill();
        p.strokeWeight(10);
        p.stroke('white');
        p.point(x, y);
        p.strokeWeight(8);
        p.stroke(col);
        p.point(x, y);
    }

    function getPositive(array, n) {
        let r, theta;
        for (; array.length < n;) {
            r = 0.2 * Math.sqrt(Math.random());
            theta = Math.random() * 2 * Math.PI;
            let x = r * Math.cos(theta) + 0.5;
            let y = r * Math.sin(theta) + 0.5;
            array.push([x, y]);
        }
    }

    function getNegative(array, n) {
        let r, theta;
        for (; array.length < n;) {
            r = 0.45 * Math.sqrt(Math.random());
            theta = Math.random() * 2 * Math.PI;
            let x = r * Math.cos(theta);
            let y = r * Math.sin(theta);
            if (x ** 2 + y ** 2 <= 0.3 ** 2) continue;
            x += 0.5;
            y += 0.5;
            array.push([x, y]);
        }
    }

    function getLabels(array, n, p) {
        for (let i = 0; i < n; i++) {
            if (i < p) {
                array.push(1);
            } else {
                array.push(0);
            }
        }
    }

    function getPredictors(array) {
        for (let i = 0; i <= size; i++) {
            for (let j = 0; j <= size; j++) {
                let x = i / size;
                let y = j / size;
                array.push([x, y]);
            }
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    let getColor = (f) =>
        (f < 0.5)
            ? p.lerpColor(negativeCol, midColor, f * 2)
            : p.lerpColor(midColor, positiveCol, f * 2 - 1);
    let normalizeTo = (c, a, b) => p.map(c, 0, canvasSize, a, b);
    let normalizeFrom = (c, a, b) => p.map(c, a, b, 0, canvasSize);
    p.hide = () => {
        canvas.style('display', 'none');
    }
    p.show = () => canvas.style('display', 'block');
    p.append = () => {
        container = document.getElementById("sketch");
        container.appendChild(canvas.canvas);
    }
    p.resumeTraining = () => {
        try {
            trainModel();
        } catch(error) {
            console.log("Model already training");
        }
    }
}