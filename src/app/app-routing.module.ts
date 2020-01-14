import { NgModule, ModuleWithProviders }             from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { DetailComponent } from './detail/detail.component';
import { DetailModule } from './detail/detail.module';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
  { path: '', redirectTo: '/overview', pathMatch: 'full' },
  {path: 'overview', component: OverviewComponent, data: { animation: 'Overview' }},
  {path: 'example/:tid/:id', loadChildren: './detail/detail.module#DetailModule', data: { animation: 'Detail' }},
  { path: 'about', component: AboutComponent }
]

@NgModule({
  imports: [ RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules }) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}