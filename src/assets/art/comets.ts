import * as p5 from 'p5';
import 'p5/lib/addons/p5.dom';

export const Comets = (p: p5) => {

  let circles;
  let height, width;
  let windowScaling;
  let canvas;

  p.setup = () => {
    let container = document.getElementById("sketch");

    // height = container.clientHeight
    height = p.windowHeight - 70
    width = p.windowWidth - 40
    windowScaling = p.min(1, width/2000)
    circles = new Array(Math.floor(150 * windowScaling))
    canvas = p.createCanvas(width, height);
    for (let i = 0; i < circles.length; i++) {
      circles[i] = createCircle();
    }

    p.append()
  }

  p.draw = () => {
    p.blendMode(p.BLEND);
    // GLITCH: comment background
    //background(0);
    drawBackground();
    p.fill(255);
    updateCircles(circles);
    // blendMode(EXCLUSION);
    // drawCircles(circles);
    p.blendMode(p.BLEND);
    p.fill(0);
    drawCircles(circles);
  }

  function createCircle() {
    let radius = Math.floor(Math.random()*p.PI*windowScaling*0.75) + 3;
    let acceleration = Math.random()*0.04+0.04;
    radius **= 3;
    return {
      r: radius,
      x: Math.floor(Math.random()*(width - 2*radius)) + radius, //do not cut off at edges
      y: - radius-Math.random()*2000,
      a: acceleration,
      v: 0,
    }
  }
  
  function updateCircles(circles) {
    for (let i = 0; i < circles.length; i++) {
      const element = circles[i];
      element.v += element.a;
      element.y += element.v;
      if (element.y-element.r > height) {
        circles[i] = createCircle();
      }
    }
  }
  
  function drawCircles(circles) {
    p.strokeWeight(1)
    for (let i = 0; i < circles.length; i++) {
      const e = circles[i];
      p.ellipse(e.x,e.y,e.r,e.r);
    }
  }
  
  function drawBackground() {
    p.stroke(255);
    p.strokeWeight(1.5)
    for (let i = 0; i < width; i+=Math.floor(Math.random()*20)) {
      p.line(i,height + 1.5*Math.random()*height,i,height - 1.5*Math.random()*height);
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