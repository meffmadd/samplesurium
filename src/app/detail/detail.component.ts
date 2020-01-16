import { Component, OnInit, ElementRef, ViewChild, ViewContainerRef, ComponentFactoryResolver, } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import 'p5/lib/addons/p5.dom';
import * as p5 from 'p5'

import { ExampleService } from '../example.service';
import { SketchService } from '../sketch.service';
import { generate } from 'rxjs';
import { ComponentService } from '../component.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],
  animations: [
    trigger('showHide', [
      state('shown', style({
        opacity: 1,
      })),
      state('hidden', style({
        opacity: 0.0,
      })),
      transition('shown => hidden', [
        animate('250ms ease-out')
      ]),
      transition('hidden => shown', [
        animate('150ms ease-in')
      ]),
      transition('void => *', [
        animate('800ms', style({
          opacity: 1
        }))
      ]),
    ]),
  ]
})
export class DetailComponent implements OnInit {

  @ViewChild('codeTarget', { read: ViewContainerRef, static: false}) viewCode: ViewContainerRef;
  @ViewChild('target', { read: ViewContainerRef, static: true}) viewChild: ViewContainerRef;

  private loading = false;

  public vis: boolean = true;
  public code: boolean = false;

  private id;
  private tid;
  public title;
  private myP5: p5;

  public isAnimationOptionsStateOpen = false;
  public visDisplay: 'block'|'none' = 'block';
  public codeDisplay: 'block'|'none' = 'none';


  constructor(
    private elementRef: ElementRef,
    private route: ActivatedRoute,
    private exampleService: ExampleService,
    private sketchService: SketchService,
    private componentService: ComponentService,
    private compiler: ComponentFactoryResolver,
  ) { };

  ngOnInit() {
    this.loading = true;
    console.log("init")
    this.id = +this.route.snapshot.paramMap.get('id');
    this.tid = +this.route.snapshot.paramMap.get('tid');

    this.exampleService.getOverview().subscribe(overview => {
      let title = overview.topics[this.tid].examples[this.id].title;

      console.time("createComponent")
      // and you can actually make some custom dynamic component...
      let childCmp = this.componentService.get(title); // initalized in loadSketch
      // compile then insert in your location, defined by viewChild
      let compFactory = this.compiler.resolveComponentFactory(childCmp);
      this.viewChild.createComponent(compFactory);
      console.timeEnd("createComponent")
    });
  }

  ngAfterViewInit() {
    this.exampleService.getOverview().subscribe(overview => {
      this.title = overview.topics[this.tid].examples[this.id].title;

      console.time("loadSketch")
      this.loadSketch();
      console.timeEnd("loadSketch")

      

      console.time("loadCode")
      this.loadCode();
      console.timeEnd("loadSketch")

      //this.loading = false;
      this.myP5.append();
    });
  }

  ngAfterViewChecked() {
    

    setTimeout(() => {
      this.loading = false;
  });
  }

  ngOnDestroy() {
    console.log(this.myP5);
    if (this.myP5.noLoop) this.myP5.noLoop();
    this.myP5.hide();
    console.log(this.myP5);
    if (this.myP5.remove) {
      this.myP5.remove();
      console.log("removing sketch")
    }
    if (this.myP5.exit) this.myP5.exit();
    this.myP5 = null;
  }

  async loadSketch() {

    console.log("loading sketch")
    console.time("get sketch instance")
    this.myP5 = this.sketchService.getInstance(this.title);
    console.timeEnd("get sketch instance")
    if (this.myP5.resumeTraining) this.myP5.resumeTraining();

    this.myP5.loop();
    this.myP5.show();
  }

  async loadCode() {
    let codeCmp = this.componentService.getCode(this.title); // initalized in loadSketch

    let compFactory = this.compiler.resolveComponentFactory(codeCmp);
    this.viewCode.createComponent(compFactory);

  }

  public evaluateVisDisplay() {
    this.visDisplay = (this.vis) ? 'block': 'none'
  }

  public evaluateCodeDisplay() {
    this.codeDisplay = (this.code) ? 'block': 'none'
  }

  showVis() {
    if (this.vis) return;
    this.vis = !this.vis;
    this.code = false;
  }

  showCode() {
    if (this.code) return;
    this.code = !this.code;
    this.vis = false;
  }
}