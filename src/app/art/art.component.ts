import { Component, OnInit } from '@angular/core';
import { SketchService } from '../sketch.service';
import { IsLoadingService } from '@service-work/is-loading';
import { ExampleService } from '../example.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-art',
  templateUrl: './art.component.html',
  styleUrls: ['./art.component.css']
})
export class ArtComponent implements OnInit {

  private id;
  private title: string;
  private myP5;

  constructor(
    private sketchService: SketchService,
    private route: ActivatedRoute,
    private exampleService: ExampleService,
    private isLoadingService: IsLoadingService,
    ) { }

  ngOnInit() {
    this.id = +this.route.snapshot.paramMap.get('id');

    this.exampleService.getOverview().subscribe(overview => {
      this.title = overview.art[this.id].title;

      this.myP5 = this.sketchService.getInstance(this.title);
      this.isLoadingService.remove();
      // this.myP5.append();
    });

  }

  ngOnDestroy() {
    this.myP5.hide();
    if (this.myP5.remove) {
      this.myP5.remove();
      console.log("removing sketch")
    }
    if (this.myP5.exit) this.myP5.exit();
    this.myP5 = null;
  }

}
