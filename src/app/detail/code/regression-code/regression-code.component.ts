import { Component, OnInit, ViewChild } from '@angular/core';
import { AceEditorComponent } from 'ng2-ace-editor';

@Component({
  template: `
  <ace-editor
       [(text)]="text"
        #editor style="height:500px; width:500px; margin-top:14px; border:1px;"></ace-editor>
  `
})
export class RegressionCodeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @ViewChild('editor', {static: false}) editor: AceEditorComponent;
  public text: string = `let colBkg, colPt, colLine;
const canvasSize = 500;
let btnReset;

let xs = [], ys = [];
let a, b, c, d;

const learningRate = 0.5;
let optimizer;

function setup() {
	createCanvas(canvasSize, canvasSize);
	colBkg = color(80, 80, 80);
	colPt = color(50, 50, 50);
	colLine = color(249, 86, 2, 255);
	btnReset = createButton('Reset');
	btnReset.class('p5-button');
	btnReset.mousePressed(reset);
	background(colBkg);
	noFill();

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

function mousePressed() {
	xs.push(normalizeTo(mouseX, -1, 1));
	ys.push(normalizeTo(mouseY, 1, -1));
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

function draw() {
	background(colBkg);

	stroke(colPt);
	strokeWeight(8);
	for (let i = 0; i < xs.length; i++) {
		point(normalizeFrom(xs[i], -1, 1), normalizeFrom(ys[i], 1, -1));
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
	strokeWeight(4);
	stroke(colLine);
	beginShape();
	for (let i = 0; i < x.length; i++) {
		vertex(normalizeFrom(x[i], -1, 1), normalizeFrom(y[i], 1, -1));
	}
	endShape();
}

let normalizeTo = (c, a, b) => map(c, 0, canvasSize, a, b);
let normalizeFrom = (c, a, b) => map(c, a, b, 0, canvasSize);

  `;

  ngAfterViewInit() {
    this.editor.setTheme("eclipse");

    this.editor.setReadOnly(true);
    this.editor.setMode("javascript");
  }

}

