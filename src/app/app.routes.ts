import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScatterplotComponent } from './scatterplot/scatterplot.component';

export const routes: Routes = [
    {path: '', component: ScatterplotComponent},
    {path: 'scatterplot', component: ScatterplotComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class ChartRouting {}