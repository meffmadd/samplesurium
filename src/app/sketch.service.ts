import { Injectable } from '@angular/core';
import { SketchStore } from './sketch.store';

import * as p5 from 'p5';
import 'p5/lib/addons/p5.dom';

@Injectable({
  providedIn: 'root'
})
export class SketchService {

  private sketches = {};
  private instances = {};

  constructor() {
    SketchStore.forEach((sketch) => {
      this.sketches[sketch.name] = sketch.src;
      this.instances[sketch.name] = new p5(sketch.src);
      this.instances[sketch.name].noLoop();
    });
  }

  get(name: string): (p: p5) => void {
    return this.sketches[name];
  }

  getInstance(name: string): p5 {
    return this.instances[name];
  }
}
