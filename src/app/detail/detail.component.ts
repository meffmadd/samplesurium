import { Component, OnInit, ElementRef, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import * as p5 from 'p5';
import * as tf from '@tensorflow/tfjs';

import 'p5/lib/addons/p5.sound';
import { ExampleService } from '../example.service';
import { SketchService } from '../sketch.service';
import { generate } from '../../../node_modules/rxjs';
import { ExplanationService } from '../explanation.service';
import { ComponentStore } from '../explanation.store';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  @ViewChild('target', { read: ViewContainerRef }) viewChild: ViewContainerRef;

  private p5: any;

  public showVis: boolean = true;

  private id;
  private tid;
  public title;

  private components: any = {};

  constructor(
    private elementRef: ElementRef,
    private route: ActivatedRoute,
    private exampleService: ExampleService,
    private sketchService: SketchService,
    private explanationService: ExplanationService,
    private compiler: ComponentFactoryResolver,
  ) {
    ComponentStore.forEach(c => {
      this.components[c.name] = c.cmp;
      console.log('name: '+c.name + 'comp:' + c.cmp);
    });
   };

  ngOnInit() {
    this.id = +this.route.snapshot.paramMap.get('id');
    this.tid = +this.route.snapshot.paramMap.get('tid');
    this.loadSketch();

    // and you can actually make some custom dynamic component...
    //let childCmp = this.components['sample'];
    let childCmp = this.explanationService.get('sample');
    console.log(childCmp);    

    // compile then insert in your location, defined by viewChild
    let compFactory = this.compiler.resolveComponentFactory(childCmp);
    console.log(compFactory);
    console.log(this.viewChild);
    this.viewChild.createComponent(compFactory);

  }

  loadSketch() {
    this.exampleService.getOverview().subscribe(overview => {
      //(o => o.topics[topic].examples[example]);
      this.title = overview.topics[this.tid].examples[this.id].title;
      const s = this.sketchService.get(this.title);
      let sketch = new p5(s);
    });
  }

  toggleView() {
    this.showVis = !this.showVis;
    if (this.showVis) this.loadSketch();
  }
}