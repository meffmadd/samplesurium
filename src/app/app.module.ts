import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { OverviewComponent } from './overview/overview.component';
import { DetailComponent } from './detail/detail.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpModule } from '@angular/http';
import { HttpClientModule }    from '@angular/common/http';
import { AceEditorModule} from 'ng2-ace-editor';

import { SampleComponent } from './expl/sample/sample.component';
import { SampleCodeComponent } from './code/sample-code/sample-code.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    OverviewComponent,
    DetailComponent,
    SampleComponent,
    SampleCodeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpModule,
    HttpClientModule,
    AceEditorModule
  ],
  entryComponents: [SampleComponent, SampleCodeComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
