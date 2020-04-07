import * as p5 from 'p5';
import 'p5/lib/addons/p5.dom';

export const Strings = (p: p5) => {
  let lineObj;
  let t = 0;
  let numLines = 8;
  let lines;
  let canvas, height, width;

  p.setup = () => {
      // height = container.clientHeight
      height = p.windowHeight - 70
      width = p.windowWidth - 40

      canvas = p.createCanvas(width, height);
      p.background(255)

      lines = Array(numLines);
      for (let i = 0; i < numLines; i++) {
        let x = ((i+1)/(numLines+1)) * width;
        lines[i] = new Line(x);
      }
      p.stroke(0)
      p.strokeWeight(12)

      p.append()
  }

  p.draw = () => {
    p.background(255, 30);
    let xPos = p.mouseX
    
    t+=0.05
    let oscilation = Math.cos(t) * 10
    for (let i = 0; i < numLines; i++) {
      lineObj = lines[i];
      let prox = getCursorProximity(xPos, lineObj.xPos)
      lineObj.displace(prox, oscilation, t)
      lineObj.draw()
    }
  }

  class Line {

    private xPos;
    private numPoints;
    private points;

    constructor(xPos, numPoints=75) {
      this.xPos = xPos;
      this.numPoints = numPoints;
      this.points = new Array(numPoints)
      for (let i = 0; i < numPoints; i++) {
        this.points[i] = new Point(xPos, (i/numPoints)*height)
      }
    }
  
    draw() {
      for (let i = 0; i < this.numPoints-1; i++) {
        let p1 = this.points[i]
        let p2 = this.points[i+1]
        p.line(p1.x, p1.y, p2.x, p2.y)
      }
    }
  
    displace(cursorProximity, oscilation, time) {
      let factor = p.map(cursorProximity, 0, 1, 10, 1)
  
      // put calculations outside of Point.displace for performance
      factor = 400*factor
      time = time * 1.5
      let dampen = (1 - cursorProximity) * 0.15
  
      this.points.map((p) => p.displace(this.xPos, cursorProximity, factor, time, dampen))
    }
  
  }

    class Point {

      public x;
      public y;

      constructor(x,y) {
        this.x = x
        this.y = y
      }
    
      displace(baseX, cursorProximity, factor, time, dampen) {
        // TODO: introduce different phase for each line
        this.x += Math.sin(this.y/30 - time)  * this.y/factor
    
        // let deviation = this.x - baseX;
        this.x -= (this.x - baseX) * dampen // dampen when cursorProximity is low
      }
  }

  function getCursorProximity(xPos, xTarget) {
    let x = p.map(Math.abs(xPos - xTarget), -width/2, width/2, -2, 2)
    return 4 * densityEstimate(x)
  }
  
  function densityEstimate(scaledX) {
    let inv = 1/Math.pow(Math.E, scaledX)
    return inv/((1+inv)**2)
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