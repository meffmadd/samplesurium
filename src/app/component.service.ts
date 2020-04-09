import { Injectable } from '@angular/core';
import { ComponentStore } from './explanation.store';

@Injectable({
  providedIn: 'root'
})
export class ComponentService {

  private components: any = {};
  private code: any = {};

  constructor() {
    ComponentStore.forEach(c => {
      this.components[c.name] = c.cmp;
    });
  }

  get(name: string) {
    return this.components[name];
  }

  getCode(name: string) {
    return this.code[name];
  }
}
