import { Component, OnInit } from '@angular/core';
import { ExampleService } from '../example.service';
import { Topic } from '../interfaces/topic';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes
} from '@angular/animations';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
  animations: [
    trigger('flyInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('0.25s', keyframes([
          style({ opacity: 0.1, transform: 'translateX(0px)', offset: 0.3 }),
          style({ opacity: 1, transform: 'translateX(0px)', offset: 1 })
        ])),
      ]),
      transition(':leave', [
        animate('0.2s ease-out', style({ opacity: 0, transform: 'translateX(-20px)' }))
      ])
    ]),
  ]
})
export class OverviewComponent implements OnInit {

  constructor(private exampleService: ExampleService) { }

  public overview: { topics: Topic[] };

  ngOnInit() {
    this.getOverview();
  }

  getOverview(): void {
    this.exampleService.getOverview().subscribe(o => this.overview = o);
  }

}
