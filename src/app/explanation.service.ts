import { Injectable } from '@angular/core';
import { ComponentStore } from './explanation.store';

@Injectable({
  providedIn: 'root'
})
export class ExplanationService {

  private components: any = {}

  constructor() {
    ComponentStore.forEach(c => {
      this.components[c.name] = c.cmp;
    });
  }

  get(name: string) {
    return this.components[name];
  }

}
