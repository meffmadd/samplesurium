import * as p5 from 'p5';
import 'p5/lib/addons/p5.dom';
import * as tf from '@tensorflow/tfjs';

export const Regression = (p: p5) => {
    let colBkg, colPt, colLine;
    const canvasSize = 500;
    let canvas, container, btnReset;

    let xs = [], ys = [];
    let a, b, c, d;

    const learningRate = 0.5;
    let optimizer;

    p.setup = () => {
        canvas = p.createCanvas(canvasSize, canvasSize);
        colBkg = p.color(80, 80, 80);
        colPt = p.color(50, 50, 50);
        colLine = p.color(249, 86, 2, 255);
        btnReset = p.createButton('Reset');
        btnReset.class('p5-button');
        btnReset.mousePressed(reset);
        p.background(colBkg);
        p.noFill();
        p.hide();

        a = tf.variable(tf.scalar(Math.random()));
        b = tf.variable(tf.scalar(Math.random()));
        c = tf.variable(tf.scalar(Math.random()));
        d = tf.variable(tf.scalar(Math.random()));

        optimizer = tf.train.adam(learningRate);
        //optimizer = tf.train.adagrad(learningRate);
    }

    function reset() {
        tf.tidy(() => {
            a = tf.variable(tf.scalar(Math.random()));
            b = tf.variable(tf.scalar(Math.random()));
            c = tf.variable(tf.scalar(Math.random()));
            d = tf.variable(tf.scalar(Math.random()));
        });

        xs = [];
        ys = [];
    }

    p.mousePressed = () => {
        if (p.mouseX > canvasSize || p.mouseX < 0 || p.mouseY > canvasSize || p.mouseY < 0) return;
        xs.push(normalizeTo(p.mouseX, -1, 1));
        ys.push(normalizeTo(p.mouseY, 1, -1));
    }

    function loss(predictions, labels) {
        const meanSquareError = predictions.sub(labels).square().mean();
        return meanSquareError;
    }

    // predict y from x-value
    function predict(x) {
        return tf.tidy(() => {
            return a.mul(tf.pow(x, tf.scalar(3)))
                .add(b.mul(tf.square(x)))
                .add(c.mul(x))
                .add(d);
        });
    }

    p.draw = () => {
        p.background(colBkg);

        p.stroke(colPt);
        p.strokeWeight(8);
        for (let i = 0; i < xs.length; i++) {
            p.point(normalizeFrom(xs[i], -1, 1), normalizeFrom(ys[i], 1, -1));
        }

        if (xs.length > 0) {
            optimizer.minimize(() => {
                const predsYs = predict(xs);
                return loss(predsYs, ys);
            });
        }


        tf.tidy(() => {
            let curveX = [];
            for (let i = -1.05; i <= 1; i += 0.02) {
                curveX.push(i);
            }
            let curveY = predict(tf.tensor1d(curveX)).dataSync();
            drawCurve(curveX, curveY);
        });


    }

    async function drawCurve(x, y) {
        p.strokeWeight(4);
        p.stroke(colLine);
        p.beginShape();
        for (let i = 0; i < x.length; i++) {
            p.vertex(normalizeFrom(x[i], -1, 1), normalizeFrom(y[i], 1, -1));
        }
        p.endShape();
    }

    let normalizeTo = (c, a, b) => p.map(c, 0, canvasSize, a, b);
    let normalizeFrom = (c, a, b) => p.map(c, a, b, 0, canvasSize);
    p.hide = () => {
        canvas.style('display', 'none');
        btnReset.style('display', 'none');
    }
    p.show = () => {
        canvas.style('display', 'block');
        btnReset.style('display', 'block');
    }
    p.append = () => {
        container = document.getElementById("sketch");
        container.appendChild(canvas.canvas);
        container.appendChild(btnReset.elt);
      }    
}