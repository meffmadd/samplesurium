import * as p5 from 'p5';
import 'p5/lib/addons/p5.dom';
import {QuadTree, Box, Point, Circle} from 'js-quadtree';

export const Space = (p: p5) => {

  let canvas;
  let height, width;
  let quadtree;
  let numPoints = 15;
  let points = [];
  let mX, mY;

  let maxSpeed = 9;
  let maxForce = 4;

  let queryRadius;

  let c, m, y;

  p.setup = () => {
    height = p.windowHeight - 70
    width = p.windowWidth - 40
    canvas = p.createCanvas(width, height);
    c = p.color(0, 255, 255);
    m = p.color(255, 0, 255);
    y = p.color(255, 255, 0);
    canvas.canvas.style.cursor = "none";

    quadtree = new QuadTree(new Box(0, 0, width, height));
    let pointDistance = Math.floor(Math.min(height, width) / numPoints);
    queryRadius = 3 * pointDistance; // n points in each direction

    for (let i = 2*pointDistance; i < width-2*pointDistance; i+=pointDistance) {
      for (let j = 2*pointDistance; j < height-2*pointDistance; j+=pointDistance) {
        points.push(new Point(i,j, {base: p.createVector(i,j), v: p.createVector(0,0), a: p.createVector(0,0)}));
      }
    }
    quadtree.insert(points);
    // initial mouse pos
    mX = p.mouseX;
    mY = p.mouseY;

    p.background(255)
    p.stroke(0)
    p.strokeWeight(30)

    p.append()
  }

  p.draw = () => {
    p.blendMode(p.BLEND)
    p.background(255, 180)
  
    let newX = p.mouseX;
    let newY = p.mouseY;
  
    let mousePos = p.createVector(newX, newY)
    let change = p.createVector(mX - newX, mY - newY);
    const mouseVel = change.mag();

    // points only fee when they are close
    if (newX > 10 && newX < width - 10 && newY > 10 && newY < height - 10 && mouseVel > 0.01) {
      let queryPoints = quadtree.query(new Circle(newX, newY, queryRadius))
      queryPoints.map((po) => {updateFlee(po, mousePos, mouseVel)})
    }
  
    points.map(updateArrive)
    points.map(updatePoint)
    
    mX = newX;
    mY = newY;
    
    points.map(drawPoint)
  }

  function drawPoint(pointObj) {
    const vX = pointObj.data.v.x * 1.5;
    const vY = pointObj.data.v.y * 1.5;
    const xC = pointObj.x;
    const yC = pointObj.y;
    if (vX <= 0.9 && vY <= 0.9) {
      p.blendMode(p.BLEND)
      p.stroke(0)
      p.point(xC, yC)
      return;
    }
    p.blendMode(p.MULTIPLY);
    p.stroke(c)
    p.point(xC - vX, yC - vY)
    p.stroke(m)
    p.point(xC, yC)
    p.stroke(y)
    p.point(xC + vX, yC + vY)
  }
  
  function updatePoint(pointObj) {
    pointObj.data.v.add(pointObj.data.a)
    pointObj.x += pointObj.data.v.x
    pointObj.y += pointObj.data.v.y
  
    // reset acc for next update
    pointObj.data.a = p.createVector()
  }
  
  function updateArrive(pointObj) {
    let posVector = p.createVector(pointObj.x, pointObj.y);
    // stop computation when they are alrady there
    if (posVector.equals(pointObj.data.base)) {
      return;
    }
    let desired = p5.Vector.sub(pointObj.data.base, posVector);
    let d = desired.mag();
    // save computation when they are already very close
    if (d < 0.01) {
      pointObj.x = pointObj.data.base.x
      pointObj.y = pointObj.data.base.y
      pointObj.data.v = p.createVector(0,0)
      return;
    } 
    let speed = maxSpeed;
    if (d < queryRadius) {
      speed = p.map(d, 0, queryRadius, 0, maxSpeed);
    }
    desired.setMag(speed)
    let steer = p5.Vector.sub(desired, pointObj.data.v)
    steer.limit(maxForce)
  
    // finally add steer to acc
    pointObj.data.a.add(steer);
  }
  
  function updateFlee(pointObj, mousePos, mouseVel) {
    let posVector = p.createVector(pointObj.x, pointObj.y);
    let desired = p5.Vector.sub(mousePos, posVector);
    if (desired.mag() > queryRadius) {
      return;
    }
    desired.setMag(maxSpeed)
    desired.mult(-1)
    let steer = p5.Vector.sub(desired, pointObj.data.v)
    let f = p.map(mouseVel, 0, 10, 0, 1)
    steer.mult(f)
    steer.limit(maxForce)
  
    // finally add steer to acc
    pointObj.data.a.add(steer);
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