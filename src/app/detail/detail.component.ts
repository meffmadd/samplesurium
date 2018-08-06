import { Component, OnInit, ElementRef, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef, ViewChildren, QueryList } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import * as p5 from 'p5';
import * as tf from '@tensorflow/tfjs';

import 'p5/lib/addons/p5.sound';
import { ExampleService } from '../example.service';
import { SketchService } from '../sketch.service';
import { generate } from 'rxjs';
import { ComponentService } from '../component.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  @ViewChild('codeTarget', {read: ViewContainerRef}) viewCode: ViewContainerRef;
  @ViewChild('target', { read: ViewContainerRef }) viewChild: ViewContainerRef;

  private p5: any;

  public vis: boolean = true;
  public code: boolean = false;

  private id;
  private tid;
  public title;


  constructor(
    private elementRef: ElementRef,
    private route: ActivatedRoute,
    private exampleService: ExampleService,
    private sketchService: SketchService,
    private componentService: ComponentService,
    private compiler: ComponentFactoryResolver,
  ) { };

  ngOnInit() {
    this.id = +this.route.snapshot.paramMap.get('id');
    this.tid = +this.route.snapshot.paramMap.get('tid');
    this.loadSketch();

    // and you can actually make some custom dynamic component...
    let childCmp = this.componentService.get('sample');

    // compile then insert in your location, defined by viewChild
    let compFactory = this.compiler.resolveComponentFactory(childCmp);
    this.viewChild.createComponent(compFactory);

    this.loadCode();
  }

  loadSketch() {
    this.exampleService.getOverview().subscribe(overview => {
      //(o => o.topics[topic].examples[example]);
      this.title = overview.topics[this.tid].examples[this.id].title;
      const s = this.sketchService.get(this.title);
      let sketch = new p5(s);
    });
  }

  loadCode() {
    let codeCmp = this.componentService.getCode('sample');

    let compFactory = this.compiler.resolveComponentFactory(codeCmp);
    this.viewCode.createComponent(compFactory);
  }

  showVis() {
    if (this.vis) return;
    this.vis = !this.vis;
    this.code = false;
    //this.loadSketch();
  }

  showCode() {
    if (this.code) return;
    this.code = !this.code;
    this.vis = false;
  }
}