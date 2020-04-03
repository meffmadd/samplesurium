import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sample',
  template: `
    <p>
    All of the visualisations I did here are made in <a href="https://p5js.org">p5js</a>. It is a very simple tool for beginners and can be used in arbitrary projects like here (although with much more painfully).
    </p>

    <p>
    The basic principle is that you have a setup function to create the necessary data structures and such, before the call function is executed several times per second to create the images. Besides these it also provides numerous helper functions which can be found in the <a href="https://p5js.org/reference/">reference</a>
    </p>
  `,
  styles: ['p {margin-top: 1em;}']
})
export class SampleComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
