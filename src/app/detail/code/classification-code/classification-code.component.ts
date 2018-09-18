import { Component, OnInit, ViewChild } from '@angular/core';
import { AceEditorComponent } from 'ng2-ace-editor';

@Component({
  selector: 'app-classification-code',
  templateUrl: './classification-code.component.html',
  styles: []
})
export class ClassificationCodeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    this.editor.setTheme("eclipse");

    this.editor.setReadOnly(true);
    this.editor.setMode("javascript");
  }

  @ViewChild('editor') editor: AceEditorComponent;
  public text: string = `const canvasSize = 500;
const resolution = 20;
const size = canvasSize / resolution;
let positive = [], negative = [], labels = [], xPred = [];
let positiveCol, negativeCol, midColor;
let upscaleRes = 80;

let updated = true;

let model, optimizer;
let xs, ys, xInputs;
let cols = rows = 10;

function setup() {
  createCanvas(canvasSize, canvasSize);
  positiveCol = color('#f95602');
  //negativeCol = color('#5d9eff');
  negativeCol = color(30, 38, 70);
  midColor = color('white');
  strokeWeight(8);
  let nPos = 170;
  let nNeg = 250;
  getPositive(positive, nPos);
  getNegative(negative, nNeg);
  getLabels(labels, nPos + nNeg, nPos);
  getPredictors(xPred);
  positive.push(...negative);

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
    shuffle: true,
    epochs: 10
  });
}

// fixes memory leak
async function trainModel() {
  for (let i = 0; i < 10; i++) {
    sleep(10);
    console.log(tf.memory().numTensors);
    await train();
    console.log(tf.memory().numTensors);
  }
}

function draw() {
  if (!updated) return;
  updated = false;
  drawCountour().then(() => {
    updated = true
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
    noStroke();
    for (let i = 0; i < predSize; i++) {
      for (let j = 0; j < predSize; j++) {
        fill(getColor(yPreds[index++]));
        rect(i * tileSize, j * tileSize, tileSize, tileSize);
      }
    }
  });
}

// if framerate is reduced, the model trains faster
function evaluateFramerate() {
  let fps = frameRate();
  fps = Math.floor(fps * 0.8);
  if (fps > 10) {
    frameRate(fps);
    console.log("Framerate changed to: " + fps);
  }
}

async function adjustFrameRate() {
  //if (upscaleRes < 30) return;
  let fps = Math.floor(frameRate());
  if (fps >= 15) {
    upscaleRes = Math.floor(upscaleRes * 1.3);
    frameRate(fps * 0.8);
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
  noFill();
  strokeWeight(10);
  stroke('white');
  point(x, y);
  strokeWeight(8);
  stroke(col);
  point(x, y);
}

function getPositive(array, n) {
  let r, theta;
  for (; array.length < n;) {
    r = 0.2 * Math.sqrt(Math.random());
    theta = Math.random() * 2 * Math.PI;
    x = r * Math.cos(theta) + 0.5;
    y = r * Math.sin(theta) + 0.5;
    array.push([x, y]);
  }
}

function getNegative(array, n) {
  let r, theta;
  for (; array.length < n;) {
    r = 0.45 * Math.sqrt(Math.random());
    theta = Math.random() * 2 * Math.PI;
    x = r * Math.cos(theta);
    y = r * Math.sin(theta);
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
    ? lerpColor(negativeCol, midColor, f * 2)
    : lerpColor(midColor, positiveCol, f * 2 - 1);
let normalizeTo = (c, a, b) => map(c, 0, canvasSize, a, b);
let normalizeFrom = (c, a, b) => map(c, a, b, 0, canvasSize);
  `

}
