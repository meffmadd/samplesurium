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
    });
  }

  get(name: string): (p: p5) => void {
    return this.sketches[name];
  }

  getInstance(name: string): p5 {
    /*
    if (this.instances[name] === undefined && this.get(name) !== undefined) {
      let sketch = this.get(name);
      this.instances[name] = new p5(sketch);
      this.instances[name].noLoop();
    }
    return this.instances[name];
    */
   return new p5(this.get(name)) // no caching
  }
}
