import { Injectable } from '@angular/core';
import { SketchStore } from './sketch.store';

@Injectable({
  providedIn: 'root'
})
export class SketchService {

  private sketches: any = {};

  constructor() {
    SketchStore.forEach((sketch) => {
      this.sketches[sketch.name] = sketch.src;
    })
  }

  get(name: string): (p: any) => void {
    return this.sketches[name];
  }
}
