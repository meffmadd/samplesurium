import { Component, OnInit, ElementRef, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef, ViewChildren, QueryList } from '@angular/core';

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
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  @ViewChild('codeTarget', { read: ViewContainerRef }) viewCode: ViewContainerRef;
  @ViewChild('target', { read: ViewContainerRef }) viewChild: ViewContainerRef;


  public vis: boolean = true;
  public code: boolean = false;

  private id;
  private tid;
  public title;
  private myP5: p5;


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
    this.exampleService.getOverview().subscribe(overview => {
      this.title = overview.topics[this.tid].examples[this.id].title;

      this.loadSketch();

      // and you can actually make some custom dynamic component...
      let childCmp = this.componentService.get(this.title); // initalized in loadSketch
      // compile then insert in your location, defined by viewChild
      let compFactory = this.compiler.resolveComponentFactory(childCmp);
      this.viewChild.createComponent(compFactory);

      this.loadCode();
    });


  }

  ngOnDestroy() {
    console.log(this.myP5);
    this.myP5.noLoop();
    this.myP5.hide();
    console.log(this.myP5);
    //this.myP5.remove();
    //this.myP5.exit();
    this.myP5 = null;
  }

  loadSketch() {

    this.myP5 = this.sketchService.getInstance(this.title);
    if (this.myP5.resumeTraining) this.myP5.resumeTraining();
    this.myP5.append();
    this.myP5.loop();
    this.myP5.show();

  }

  async loadCode() {
    let codeCmp = this.componentService.getCode(this.title); // initalized in loadSketch

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