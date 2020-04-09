import * as p5 from 'p5';
import 'p5/lib/addons/p5.dom';
import * as tf from '@tensorflow/tfjs';
import { Thread } from '../app/thread.js'

export const Classification = (p: p5) => {
    let canvas, container;
    const canvasSize = 500;
    let resolution = 15;
    const size = canvasSize / resolution;
    let positive = [], negative = [], labels = [], xPred = [];
    let positiveCol, negativeCol, midColor;
    let upscaleRes = 50;

    let updated = true;
    let trainIteration = 0;
    let modelIsReady = false;

    let model, optimizer;
    let xs, ys, xInputs;

    p.setup = () => {
        console.log("starting setup")
        canvas = p.createCanvas(canvasSize, canvasSize);
        p.frameRate(15);
        positiveCol = p.color('#f95602');
        //negativeCol = color('#5d9eff');
        negativeCol = p.color(30, 38, 70);
        midColor = p.color('white');
        p.strokeWeight(8);
        let nPos = 50;
        let nNeg = 100;
        getPositive(positive, nPos);
        getNegative(negative, nNeg);
        getLabels(labels, nPos + nNeg, nPos);
        getPredictors(xPred);
        positive.push(...negative);
        // p.hide();
        drawPoints()
        tf.setBackend('webgl');

        p.frameRate(5);

        prepareModel()

        p.show();

        setTimeout(evaluateFramerate, 3000);
        setTimeout(adjustFrameRate, 4000);
    }

    function train() {
        return model.fit(xs, ys, {
            batchSize: 50,
            epochs: 15
        });
    }

    async function prepareModel() {
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

        optimizer = tf.train.adam(0.05);
        model.compile({
            optimizer: optimizer,
            loss: tf.losses.meanSquaredError
        });

        modelIsReady = true;
        // trainModel();
    }

    // fixes memory leak
    async function trainModel() {
        for (; trainIteration < 15; trainIteration++) {
            //sleep(10);
            if (p._loop) {
                await tf.nextFrame();
                await train();
            } else {
                break;
            }
        }
    }


    p.draw = () => {
        if (!updated) return;
        updated = false;
        setTimeout(() => {
            if (modelIsReady && !updated) {
                drawCountour().then(async () => {
                    updated = true;
                });
            }
        }, 50)
    }

    function drawPoints() {
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

    async function drawCountour() { // TODO: this function takes ages at first run (like 2500+ ms) FIX!!!
        await tf.nextFrame();
        tf.engine().startScope()
        let yOutputs = model.predict(xInputs);
        // await tf.nextFrame();
        const reshaped = yOutputs.reshape([Math.floor(size) + 1, Math.floor(size) + 1, 1]);
        const resized = reshaped //tf.image.resizeBilinear(reshaped, [upscaleRes, upscaleRes]);
        // await tf.nextFrame();
        resized.data().then((yPreds) => {
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
            drawPoints()
        });
        tf.engine().endScope()
        updated = true;
    }

    // if framerate is reduced, the model trains faster
    async function evaluateFramerate() {
        let fps = p.frameRate();
        fps = Math.floor(fps * 0.6);
        if (fps > 10) {
            p.frameRate(fps);
            console.log("Framerate changed to: " + fps);
        }
    }

    async function adjustFrameRate() {
        if (!p._loop) return;
        if (upscaleRes < 20) return;
        let fps = Math.floor(p.frameRate());
        if (fps >= 10) {
            resolution -= 5
            upscaleRes = Math.floor(upscaleRes * 1.1);
            p.frameRate(fps * 0.8);
        } else if (fps < 2) {
            resolution += 5;
            upscaleRes = Math.floor(upscaleRes * 0.6);
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
            r = 0.15 * Math.sqrt(Math.random());
            theta = Math.random() * 2 * Math.PI;
            let x = r * Math.cos(theta) + 0.5;
            let y = r * Math.sin(theta) + 0.5;
            array.push([x, y]);
        }
    }

    function getNegative(array, n) {
        let r, theta;
        for (; array.length < n;) {
            r = 0.35 * Math.sqrt(Math.random());
            theta = Math.random() * 2 * Math.PI;
            let x = r * Math.cos(theta);
            let y = r * Math.sin(theta);
            if (x ** 2 + y ** 2 <= 0.2 ** 2) continue;
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
    p.show = () => {
        canvas.style('display', 'block');
    }
    p.append = () => {
        container = document.getElementById("sketch");
        container.appendChild(canvas.canvas);
    }
    p.resumeTraining = async () => {
        try {
            trainModel();
            setTimeout(adjustFrameRate, 500);
        } catch (error) {
            // console.log("Model already training");
        }
    }
}