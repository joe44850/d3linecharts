import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SpotComponent } from './scatterplot/spot.component';

export const routes: Routes = [
    {path: '', component:SpotComponent},
    {path: 'spot', component: SpotComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class ChartRouting{};