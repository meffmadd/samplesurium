import * as p5 from 'p5';
import 'p5/lib/addons/p5.dom';

export const Breathe = (p: p5) => {

  let canvas, container;
  let half;
  let layers = new Array(10);
  let palette = ['rgb(22, 48, 65)', 'rgb(18, 76, 115)', 'rgb(45, 84, 169)', 'rgb(23, 149, 211)',  'rgb(117, 200, 255)'];

  let n = 0;
  let i = 0;
  let l = layers.length-1;

  let height = 0;
  let width = 0;

  p.setup = () => {
    let container = document.getElementById("sketch");

    // height = container.clientHeight
    height = p.windowHeight - 70
    width = p.windowWidth - 40
    console.log("windowHeight: " + height + " windowWidth: " + width)
    canvas = p.createCanvas(width, height);
    half = Math.floor(width/2);
    p.background(255);
    p.strokeWeight(3);
    p.frameRate(30);
  
    for (let i = 0; i < layers.length; i+=2) {
      layers[i] = new BezierLine(0);
      layers[i+1] = new BezierLine(0);
    }

    p.append()
  }

  p.draw = () => {
    p.background(255);
    i++;
    i = i % 10;

    let x = ((Math.sin(n))**2)*25+20;
    
    for (let i = 0; i < palette.length; i++) {
      const col = palette[palette.length-i-1];
      let right = layers[l-(2*i)];
      let left = layers[l-(2*i+1)];

      let f = (l-2*(i-1))/l;
      //f *= 0.5;
      right.update(f*x+(10*(l-2*i)));
      left.update(f*-x-(10*(l-2*i)));

      right.fill(col);
      right.draw(col);
      left.fill(col);
      left.draw(col);
    }

    n+=0.01;
  }

  let f = (v) => Math.floor(v);

  function Point(x,y) {
    this.x = x;
    this.y = y;
  
    this.draw = function() {
      p.ellipse(x,y,5,5);
    }
  }
  
  function BezierCurve(x1,y1,x2,y2,x3,y3,x4,y4) {
    this.points = new Array(4);
    this.p1 = this.points[0] = new Point(x1,y1);
    this.p2 = this.points[1] = new Point(x2,y2);
    this.p3 = this.points[2] = new Point(x3,y3);
    this.p4 = this.points[3] = new Point(x4,y4);
  
    this.draw = function () {
      p.bezier(this.p1.x,this.p1.y,this.p2.x,this.p2.y,this.p3.x,this.p3.y,this.p4.x,this.p4.y);
    }
  
    this.fill = function(col,bottom) {
      p.fill(col);
      p.stroke(col);
      p.beginShape();
      p.vertex(this.p1.x,this.p1.y);
      p.bezierVertex(this.p2.x,this.p2.y,this.p3.x,this.p3.y,this.p4.x,this.p4.y);
      if (bottom) p.vertex(this.p4.x,this.p1.y);
      else p.vertex(this.p1.x,this.p4.y);
      p.endShape();
    }
  
    this.getPoints = function() {
      return this.points;
    }
  
    this.setPoints = function(points) {
      this.points = points;
    }
  
    this.drawPoints = function() {
      for (let i = 0; i < this.points.length; i++) {
        const element = this.points[i];
        element.draw();
      }
    }
  }
  
  let extrapolate = function(p1,p2,factor) {
    let dx = p2.x-p1.x;
    let dy = p2.y-p1.y;
    return new Point(p2.x+factor*dx,p2.y+factor*dy);
  }
  
  function BezierLine(x1) {
    let h = height, w = width, s = half;
    let h10 = f(h/10), h6 = f(h/6);
    this.b1 = new BezierCurve(s, 0, s, h10, s, h10, s+x1, h6);
  
    let point = extrapolate(new Point(s, h10),new Point( s+x1, h6), 2);
    this.b2 = new BezierCurve(s+x1, h6, point.x, point.y, point.x, h-point.y, s+x1, h-h6);
    
    this.b3 = new BezierCurve(s, h-h6, s, h-h10, s, h-h10, s+x1, h);
  
    this.draw = function (col) {
      p.stroke(col);
      this.b1.draw();
      this.b2.draw();
      this.b3.draw();
    }
  
    this.update = function (x) {
      let h = height, w = width, s = half;
      let h10 = f(h/10), h6 = f(h/6);
      let points = this.b1.getPoints();
      let point = extrapolate(new Point(s, h10),new Point( s+x, h6), 2);
      points[3].x = s+x;
      points = this.b2.getPoints();
      points[0].x = s+x;
      points[1].x = point.x; points[1].y = point.y;
      points[2].x = point.x; points[2].y = h-point.y; 
      points[3].x = s+x;
      points = this.b3.getPoints();
      points[0].x = s+x;
    }
  
    this.fill = function(col) {
      let h6 = f(h/6);
      // TODO: make more efficient! (20% CPU without 50% with)
      this.b1.fill(col,false);
      this.b3.fill(col,true);
  
      p.fill(col);
      // p.noStroke();
      this.b2.draw();
      let points = this.b2.getPoints();
      p.stroke(col)
      p.rect(s, h6, points[0].x-half, h-2*h6);
      p.noFill();
      // p.stroke(0);
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