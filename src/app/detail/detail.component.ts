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
import { IsLoadingService } from '@service-work/is-loading'
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

  @ViewChild('target', { read: ViewContainerRef, static: true}) viewChild: ViewContainerRef;


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
    private isLoadingService: IsLoadingService,
  ) { };

  ngOnInit() {
    console.log("init")
    // this.isLoadingService.add()

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
      this.loadSketch().then(() => {
        //this.loading = false;
        this.myP5.append();
      });
      console.timeEnd("loadSketch")

      this.isLoadingService.remove();
      console.log("view init done")
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

    console.time("get sketch instance")
    this.myP5 = await this.sketchService.getInstance(this.title);
    console.timeEnd("get sketch instance")
    if (this.myP5.resumeTraining) this.myP5.resumeTraining();
    this.myP5.loop();
    this.myP5.resize = () => {
      let viewContainer = document.getElementsByClassName("viewContainer")[0] as HTMLElement;
      let height = Math.min(this.myP5.windowHeight - 40, 500);
      let width = Math.min(this.myP5.windowWidth - 40, 500);
      let size = Math.min(height, width)
      this.myP5.resizeCanvas(size, size);
      viewContainer.style.height = size + 30 +"px"
    }
    this.myP5.windowResized = () => {
      this.myP5.resize()
    }
    this.myP5.resize();
    // this.myP5.show();
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