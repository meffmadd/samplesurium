import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KatexModule } from 'ng-katex';

import { DetailRoutingModule } from './detail-routing.module';
import { DetailComponent } from './detail.component';
import { SampleComponent } from './expl/sample/sample.component';
import { SampleCodeComponent } from './code/sample-code/sample-code.component';
import { AppRoutingModule } from '../app-routing.module';
import { AceEditorModule } from 'ng2-ace-editor';
import { TensorsCodeComponent } from './code/tensors-code/tensors-code.component';
import { TensorsComponent } from './expl/tensors/tensors.component';
import { RegressionComponent } from './expl/regression/regression.component';
import { RegressionCodeComponent } from './code/regression-code/regression-code.component';
import { ClassificationCodeComponent } from './code/classification-code/classification-code.component';
import { ClassificationComponent } from './expl/classification/classification.component';
import { TicTacToeComponent } from './expl/tic-tac-toe/tic-tac-toe.component';
import { TicTacToeCodeComponent } from './code/tic-tac-toe-code/tic-tac-toe-code.component';

@NgModule({
  imports: [
    CommonModule,
    DetailRoutingModule,
    AceEditorModule,
    KatexModule,
  ],
  declarations: [
    DetailComponent,
    SampleComponent, SampleCodeComponent,
    TensorsComponent, TensorsCodeComponent,
    RegressionComponent, RegressionCodeComponent, 
    ClassificationCodeComponent, ClassificationComponent, 
    TicTacToeComponent, TicTacToeCodeComponent
  ],
  entryComponents: [
    SampleComponent, SampleCodeComponent,
    TensorsComponent, TensorsCodeComponent,
    RegressionComponent, RegressionCodeComponent,
    ClassificationCodeComponent, ClassificationComponent,
    TicTacToeCodeComponent, TicTacToeComponent
  ],
})
export class DetailModule { }
