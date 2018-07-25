import { Component, OnInit, ElementRef } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import 'p5';
import { ExampleService } from '../example.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  constructor(
    private elementRef:ElementRef,
    private route: ActivatedRoute,
    private location: Location,
    private exampleService: ExampleService
  ) {};

  private p5;

  private explaination: string;
  private code: string;

  ngAfterViewInit() {
    let s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "../assets/xor/sketch.js";
    this.elementRef.nativeElement.appendChild(s);
    
  }

  ngOnInit() {
    this.initExample();
  }


  initExample() {
    const id = +this.route.snapshot.paramMap.get('id');
    const tid = +this.route.snapshot.paramMap.get('tid');

    console.log("tid:" + tid + " id:" + id);

    this.exampleService.getExplaination(tid, id).subscribe(e => this.explaination = e);
  }

}
