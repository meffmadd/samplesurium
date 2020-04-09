import * as tf from '@tensorflow/tfjs';
import * as p5 from 'p5';
import 'p5/lib/addons/p5.dom';

export const Tensors = (p: p5) => {
    const size = 100;
    const canvasSize = 500;
    const tileSize = canvasSize / size;
    let updated = true;


    const filter = tf.tensor4d([1, 1, 1, 1, 0, 1, 1, 1, 1], [3, 3, 1, 1], 'int32');
    let init = tf.tensor2d(getInitalState(), [size, size], 'int32');
    const world = tf.variable(init);

    let rst, stop, run, speed;
    let canvas, container;

    p.setup = () => {
        canvas = p.createCanvas(canvasSize, canvasSize);
        p.frameRate(10);
        p.fill(0);

        speed = p.createSlider(1, 60, 15);
        rst = p.createButton('Reset');
        stop = p.createButton('Stop');
        run = p.createButton('Run');
        rst.mousePressed(resetWorld);
        stop.mousePressed(() => {
            updated = false;
            drawWorld();
            p.noLoop();
        });
        run.mousePressed(() => {
            updated = true;
            p.loop();
        });
        addClasses();
        setPositions();
        p.show();
    }

    function resetWorld() {
        init.dispose();
        init = tf.tensor2d(getInitalState(), [size, size], 'int32');
        world.assign(init);
        p.background(255);
        drawWorld();
    }

    p.draw = () => {
        p.frameRate(speed.value());
        if (!updated) return;
        step().then(() => { updated = true });
    }

    p.mousePressed = () => {
        let x = snapToCell(p.mouseX);
        let y = snapToCell(p.mouseY);
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
            if (data[i] === 1) p.rect(snapToCell((i / size) * tileSize), (i % size) * tileSize, tileSize, tileSize);
        }
    }

    async function step() {
        let current = await world.data();
        await tf.tidy(() => {
            const conv = tf.tensor3d(current, [size, size, 1], 'int32');
            const data = tf.conv2d(conv, filter, 1, 'same').dataSync(); // data sync fixes bug in safari
            for (let i = 0; i < data.length; i++) {
                current[i] = updateCellState(current[i], data[i]);
            }

            const newState = tf.tensor2d(current, [size, size], 'int32');
            world.assign(newState);
            p.background(255);
            drawWorld();
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
        p.background(255);
        drawWorld();
    }

    function getInitalState() {
        let state = new Int32Array(size * size);
        for (let i = 0; i < state.length; i++) {
            state[i] = 0;
        }
        let mid = Math.floor(size / 2);
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

    function setPositions() {
        speed.position(20, canvasSize - 30);
        rst.position(150, canvasSize - 30);
        stop.position(220, canvasSize - 30);
        run.position(280, canvasSize - 30);
    }

    p.hide = () => {
        canvas.style('display', 'none');
        speed.style('display', 'none');
        rst.style('display', 'none');
        stop.style('display', 'none');
        run.style('display', 'none');
    }
    p.show = () => {
        canvas.style('display', 'block');
        speed.style('display', 'block');
        rst.style('display', 'block');
        stop.style('display', 'block');
        run.style('display', 'block');
    }
    p.append = () => {
        container = document.getElementById("sketch");
        container.appendChild(canvas.canvas);
        container.appendChild(speed.elt);
        container.appendChild(rst.elt);
        container.appendChild(stop.elt);
        container.appendChild(run.elt);
    }

}