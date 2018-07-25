let rects = [];

function setup() {
  createCanvas(400,400);
  background(100);
  noStroke();
  fill(255,255,255);
  for (let index = 0; index < 40; index++) {
    rects[index] = 0;
  }
}

let reachedEnd = 0;

function draw() {
  for (let i = 0; i < rects.length; i++) {
    if (rects[i] >= 800) {
      drawRect(i);
      continue;
    }
    let prog = Math.round(Math.random()*6);
    prog = prog ** 2;
    rects[i] +=prog;
    if (rects[i] >= 800) reachedEnd++;
    drawRect(i);
    if (reachedEnd === 40) reset();
  }
}

function drawRect(i) {
  rect(0,i*20,rects[i],20);
}

function reset() {
  let r = Math.round(Math.random()*255);
  let g = Math.round(Math.random()*255);
  let b = Math.round(Math.random()*255);
  fill(r,g,b);
  reachedEnd = 0;
  for (let i = 0; i < 40; i++) {
    rects[i] = 0;
  }
}