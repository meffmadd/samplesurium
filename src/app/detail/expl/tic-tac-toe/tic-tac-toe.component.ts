import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tic-tac-toe',
  templateUrl: './tic-tac-toe.component.html',
  styles: []
})
export class TicTacToeComponent implements OnInit {

  boardInices: string;

  relu: string = "{f(x)=x^{+}=\max(0,x)}"

  constructor() { 
    this.boardInices = 'assets/images/boardIndices.jpg';
  }

  ngOnInit() {
  }

}
