import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { SpotComponent } from './scatterplot/spot.component';
import { ScatterplotComponent } from './scatterplot/scatterplot.component';
import { ChartRouting } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
    SpotComponent,
    ScatterplotComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ChartRouting
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
