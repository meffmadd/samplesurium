import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DetailRoutingModule } from './detail-routing.module';
import { DetailComponent } from './detail.component';
import { SampleComponent } from '../expl/sample/sample.component';
import { SampleCodeComponent } from '../code/sample-code/sample-code.component';
import { AppRoutingModule } from '../app-routing.module';
import { OverviewComponent } from '../overview/overview.component';
import { AppModule } from '../app.module';
import { AceEditorModule } from 'ng2-ace-editor';
import { TensorsCodeComponent } from '../code/tensors-code/tensors-code.component';
import { TensorsComponent } from '../expl/tensors/tensors.component';

@NgModule({
  imports: [
    CommonModule,
    DetailRoutingModule,
    AceEditorModule
  ],
  declarations: [
    DetailComponent,
    SampleComponent, SampleCodeComponent,
    TensorsComponent, TensorsCodeComponent,
  ],
  entryComponents: [
    SampleComponent, SampleCodeComponent,
    TensorsComponent, TensorsCodeComponent,
  ],
})
export class DetailModule { }
