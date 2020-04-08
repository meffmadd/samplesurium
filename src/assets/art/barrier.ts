import * as p5 from 'p5';
import 'p5/lib/addons/p5.dom';

export const Barrier = (p: p5) => {
  let canvas;
  let height, width;
  let circles = [];
  let maxRadius;
  let numCircles = 300;
  let relDist;
  let newPos;
  let circleSpeed = 1.5;

  let numCols = 4 * numCircles;
  let cols = [];
  let nextCol = 0;

  let strokeW = 0.5;

  let distFromSmallestToOuter_new;
  let distFromSmallestToOuter;

  p.setup = () => {
    height = p.windowHeight - 70;
    width = p.windowWidth - 40;
    canvas = p.createCanvas(width, height);
    canvas.canvas.style.cursor = "none";
    maxRadius = Math.min(height, width) / 2 - 50;
  
    for (let i = 0; i < numCols; i++) {
      let string = 'hsba(' + Math.floor(360*(i/numCols)) + ', 100%, 80%, 1.0)'
      cols.push(p.color(string));
    }
  
    circles.push(new Circle(width/2, height/2, cols[nextCol++]))
  
    p.strokeWeight(strokeW);
    p.background(255)
    p.noFill()

    p.append()
  }

  p.draw = () => {
    p.translate(width / 2, height / 2);
    p.background(255)
    
    let mX = p.mouseX - width / 2
    let mY = p.mouseY - height / 2
    let mousePos = p.createVector(mX, mY)
    mousePos.limit(maxRadius)
  
    circles.map(c => c.update());
    circles.map(c => c.setCentre(mousePos));
  
    if (circles[0] && circles[0].r === maxRadius && circles[1] && circles[1].r === maxRadius) {
        circles.shift()
    }
    if (circles[circles.length-1].r > maxRadius / numCircles) {
      distFromSmallestToOuter = calcDistFromSmallestToOuter()
      let prevR = circles[circles.length-1].r
      newPos = mousePos.copy()
      newPos.setMag(prevR / 2)
      newPos.add(mousePos)
      circles.push(new Circle(mX, mY, cols[nextCol]))
      nextCol = (nextCol + 1) % numCols;
      // if (newPos) circles[circles.length - 1].setCentre(newPos)
    }
    
    
    distFromSmallestToOuter_new = calcDistFromSmallestToOuter();
    if (distFromSmallestToOuter < distFromSmallestToOuter_new) {
      distFromSmallestToOuter += (distFromSmallestToOuter_new - distFromSmallestToOuter) 
        * (Math.min(width, height) / 10000);
    } else {
      distFromSmallestToOuter = distFromSmallestToOuter_new
    }	
  
    // start with 1 since outer stays the same
    relDist = distFromSmallestToOuter / circles.length;
    let moveDirection;
    for (let i = 2; i < circles.length; i++) {
      const c = circles[i];
      const c_1 = circles[i-1];
      // distSmalltoOuter + c.r + reldist
      let prevCenter = p.createVector(c_1.cX, c_1.cY)
      let currCenter = p.createVector(c.cX, c.cY)
      let distBetweenPrev = c_1.r - (c.r + Math.abs(currCenter.mag() - prevCenter.mag()))
      let moveLength = distBetweenPrev - relDist;
      
      moveDirection = mousePos.copy()
      moveDirection.setMag(moveLength)
      c.moveCentre(moveDirection)
    }
  
    circles.map(c => c.draw());
  }

  function calcDistFromSmallestToOuter() {
    const outer = circles[0]
    const inner = circles[circles.length-1]
    return outer.r - 
      (inner.r + Math.abs(
        p.createVector(outer.cX, outer.cY).mag() - p.createVector(inner.cX, inner.cY).mag()
      ))
  }

  class Circle {

    public cX;
    public cY;
    public col;
    public r;

    constructor(cX, cY, col) {
      this.cX = cX;
      this.cY = cY;
      this.col = col;
      this.r = strokeW;
    }
  
    draw() {
      p.stroke(this.col);
      p.ellipse(this.cX, this.cY, 2 * this.r);
    }
  
    update() {
      this.r += circleSpeed;
      if (this.r >= maxRadius) this.r = maxRadius;
    }
  
    setCentre(mousePos) {
      let pos = mousePos.copy()
      if (pos.mag() + this.r > maxRadius) {
        pos.setMag(maxRadius - this.r)
      }
  
      this.cX = pos.x
      this.cY = pos.y
    }
  
    moveCentre(amtVector) {
      this.cX += amtVector.x;
      this.cY += amtVector.y;
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