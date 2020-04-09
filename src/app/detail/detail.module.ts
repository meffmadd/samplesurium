import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KatexModule } from 'ng-katex';

import { DetailRoutingModule } from './detail-routing.module';
import { DetailComponent } from './detail.component';
import { SampleComponent } from './expl/sample/sample.component';
import { AppRoutingModule } from '../app-routing.module';
import { AceEditorModule } from 'ng2-ace-editor';
import { TensorsComponent } from './expl/tensors/tensors.component';
import { RegressionComponent } from './expl/regression/regression.component';
import { ClassificationComponent } from './expl/classification/classification.component';
import { TicTacToeComponent } from './expl/tic-tac-toe/tic-tac-toe.component';

@NgModule({
  imports: [
    CommonModule,
    DetailRoutingModule,
    AceEditorModule,
    KatexModule,
  ],
  declarations: [
    DetailComponent,
    SampleComponent,
    TensorsComponent,
    RegressionComponent, 
    ClassificationComponent, 
    TicTacToeComponent,
  ],
  entryComponents: [
    SampleComponent,
    TensorsComponent,
    RegressionComponent,
    ClassificationComponent,
    TicTacToeComponent
  ],
})
export class DetailModule { }
