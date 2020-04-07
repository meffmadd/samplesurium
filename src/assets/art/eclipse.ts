import * as p5 from 'p5';
import 'p5/lib/addons/p5.dom';

export const Eclipse = (p: p5) => {
  let numPoints = 250;
  let points = Array(numPoints);
  let angle = 0;
  let height, width;
  let baseRadius;
  let canvas;


  let lerpAmountMax = 0.45;
  let lerpAmountMin = 0.25;
  let lerpAmount = lerpAmountMax;
  let changeLerp = 1;

  let colBkg = 0;
  let colFor = 255;

  p.setup = () => {
    height = p.windowHeight - 70
    width = p.windowWidth - 40
    baseRadius = Math.min(height, width) / 3.5;
    canvas = p.createCanvas(width, height);
    
    for (let i = 0; i < numPoints; i++) {
      points[i] = new Point(width/2, height/2, baseRadius)
    }
  
    p.stroke(colFor)
    p.strokeWeight(5)
    p.background(colBkg)
  
    canvas.canvas.onclick = switchColors

    p.append()
  }

  function switchColors() {
    p.filter(p.INVERT)
    let temp = colFor;
    colFor = colBkg;
    colBkg = temp;
    p.stroke(colFor)
  }

  function changeLerpAmount() {
    let noiseVal = p.noise(angle/3)
    noiseVal = Math.min(0.8, noiseVal) // cap at top
    noiseVal = Math.max(0.2, noiseVal) // cap at bottom
    noiseVal = p.map(noiseVal, 0.2, 0.8, 0, 1)
    lerpAmount = noiseVal * (lerpAmountMax - lerpAmountMin) + lerpAmountMin
    if (lerpAmount < lerpAmountMin) lerpAmount = lerpAmountMin;
    if (lerpAmount > lerpAmountMax) {
      lerpAmount = lerpAmountMax;
    }
  }

  p.draw = () => {
    let speedChange = p.map(lerpAmount, lerpAmountMin, lerpAmountMax, 1.3, 1)
    angle += 0.01 * speedChange;
    
    p.background(colBkg, 15)
  
    changeLerpAmount()	
  
    points.map((point) => point.draw(angle))
  }

  class Point {

    private cx;
    private cy;
    private r;
    private startA;
    private seed;

    constructor(x,y,r) {
      this.cx = x;
      this.cy = y;
      this.r = r;
      this.startA = Math.random() * 2 * p.PI
  
      this.seed = Math.random() * 40;
    }
  
    getPoints(angle) {
      let x = this.cx + Math.cos(angle) * this.r;
      let y = this.cy + Math.sin(angle) * this.r;
  
      let v1 = p.createVector(x,y)
      let v2 = p.createVector(x,y)
      v1.lerp(this.cx, this.cy, 0, lerpAmount);
      v2.lerp(this.cx, this.cy, 0, -lerpAmount);
  
      x = p.map(p.noise(this.seed + angle/1.5), 0, 1, v1.x, v2.x)
      y = p.map(p.noise(this.seed + angle/1.5), 0, 1, v1.y, v2.y)
  
      return p.createVector(x,y)
    }
  
    draw(angle) {
      angle += this.startA;
      let p1 = this.getPoints(angle);
      let p2 = this.getPoints(angle-0.02)
      p.line(p1.x, p1.y, p2.x, p2.y)
  
      // draw line at opposite end to save performace
      p1.lerp(this.cx, this.cy, 0, 2)
      p2.lerp(this.cx, this.cy, 0, 2)
      p.line(p1.x, p1.y, p2.x, p2.y)
    }
  }  

  p.append = () => {
    let container = document.getElementById("sketch");
    container.appendChild(canvas.canvas);
  }
  p.hide = () => {
    canvas.style('display', 'none');
  }
  p.show = () => {
      canvas.style('display', 'block');
  }

}