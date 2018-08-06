import { Component, OnInit } from '@angular/core';
import { ExampleService } from '../example.service';
import { Topic } from '../interfaces/topic';
import { tick } from '@angular/core/src/render3';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {

  constructor(private exampleService: ExampleService) { }

  public overview : {topics: Topic[]};

  ngOnInit() {
    this.getOverview();
  }

  getOverview(): void {
    this.exampleService.getOverview().subscribe(o => this.overview = o);
  }

}
