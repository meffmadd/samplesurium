import { Component, OnInit, ViewChild } from '@angular/core';
import { AceEditorComponent } from '../../../../node_modules/ng2-ace-editor';

@Component({
  selector: 'app-tensors-code',
  template: `
  <ace-editor
       [(text)]="text"
        #editor style="height:500px; width:500px; margin-top:14px;"></ace-editor>
  `,
  styles: []
})
export class TensorsCodeComponent implements OnInit {

  constructor() { }

  @ViewChild('editor') editor: AceEditorComponent;
  public text: string = `
const size = 100;
const canvasSize = 500;
const tileSize = canvasSize / size;
let updated = true;


const filter = tf.tensor4d([1, 1, 1, 1, 0, 1, 1, 1, 1], [3, 3, 1, 1], 'int32');
let init = tf.tensor2d(getInitalState(), [size, size], 'int32');
const world = tf.variable(init);

let rst, stop, run, speed;

function setup() {
	createCanvas(canvasSize, canvasSize);
	frameRate(10);
	fill(0);
	speed = createSlider(1, 60, 15);
	rst = createButton('Reset');
	stop = createButton('Stop');
	run = createButton('Run');
	rst.mousePressed(resetWorld);
	stop.mousePressed(() => {
		updated = false;
		drawWorld(); 
		noLoop(); 
	});
	run.mousePressed(() => { 
		updated = true; 
		loop(); 
	});
	addClasses();
}

function resetWorld() {
	init.dispose();
	init = tf.tensor2d(getInitalState(), [size, size], 'int32');
	world.assign(init);
	background(255);
	drawWorld();
}

function draw() {
	frameRate(speed.value());
	if (!updated) return;
	step().then(()=> {updated = true});
	
}

function mousePressed() {
	let x = snapToCell(mouseX);
	let y = snapToCell(mouseY);
	if (x > canvasSize || y > canvasSize) return;
	
	let pos = coordTo1DPos(x / tileSize, y / tileSize);

	insertCell(pos);
}

function snapToCell(coord) {
	return Math.floor(coord) - (Math.floor(coord) % tileSize);
}

async function drawWorld() {
	let data = await world.data();
	for (let i = 0; i < data.length; i++) {
		if (data[i] === 1) rect(snapToCell((i / size) * tileSize), (i % size) * tileSize, tileSize, tileSize);
	}
}

async function step() {
	let current = await world.data();
	await tf.tidy(() => {
		const conv = tf.tensor3d(current, [size, size, 1], 'int32');
		tf.conv2d(conv, filter, 1, 'same').data().then((data) => {
			for (let i = 0; i < data.length; i++) {
				current[i] = updateCellState(current[i], data[i]);
			}

			const newState = tf.tensor2d(current, [size, size], 'int32');
			world.assign(newState);
			background(255);
			drawWorld();	
		});
	});
	
}

function updateCellState(p, c) {

	if (p === 0 && c === 3) return 1;
	if (p === 0) return 0;

	if (c < 2) return 0;
	else if (c === 2 || c === 3) return 1;
	else return 0;

}

async function insertCell(pos) {
	let data = await world.data();
	await tf.tidy(() => {
		if (data[pos] === 0) data[pos] = 1;
		else data[pos] = 0;
		const updatedState = tf.tensor2d(data, [size, size], 'int32');
		world.assign(updatedState);
	});
	background(255);
	drawWorld();
}

function getInitalState() {
	let state = new Int32Array(size * size);
	for (let i = 0; i < state.length; i++) {
		state[i] = 0;
	}
	let mid = Math.floor(size / 2);
	// 24 24
	state[coordTo1DPos(mid, mid)] = 1;
	state[coordTo1DPos(mid, mid + 1)] = 1;
	state[coordTo1DPos(mid, mid + 2)] = 1;
	state[coordTo1DPos(mid - 1, mid + 1)] = 1;
	state[coordTo1DPos(mid + 1, mid)] = 1;

	return state;
}

function coordTo1DPos(x, y) {
	return size * x + y;
}

function addClasses() {
	rst.class('p5-button');
	stop.class('p5-button');
	run.class('p5-button');
	speed.class('p5-slider');
}
  `;

  ngOnInit() {}
}
