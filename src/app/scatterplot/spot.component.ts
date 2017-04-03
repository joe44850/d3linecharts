import { Component, Input } from '@angular/core';

@Component({
    selector: "Spot",
    templateUrl: "spot.component.html",
    styleUrls: ['spot.component.css']
})
export class SpotComponent {

@Input() public xMinimum: number = 0;
@Input() public xMaximum: number = 5;
@Input() public yMinimum: number = 0;
@Input() public yMaximum: number = 5;
@Input() public xLabel: string;
@Input() public yLabel: string;
@Input() public fillChart: boolean;
@Input() public dataKey = "studentName";
@Input() public setDimensionsToData = false;

    constructor(){
        
    }

}