import { Component, OnInit } from '@angular/core';
import { IsLoadingService } from '@service-work/is-loading';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(
    private isLoadingService: IsLoadingService,
  ) { }

  ngOnInit() {
    this.isLoadingService.remove();
  }

}
