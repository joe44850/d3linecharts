import { Component, Input } from '@angular/core';

@Component({
    selector: "Spot",
    templateUrl: "spot.component.html",
    styleUrls: ['spot.component.css']
})
export class SpotComponent {

@Input() public xMinimum: number = 1.1;
@Input() public xMaximum: number = 4.3;
@Input() public yMinimum: number = 1;
@Input() public yMaximum: number = 5;
@Input() public xLabel: string;
@Input() public yLabel: string;
@Input() public dataKey = "studentName";

    constructor(){
        
    }

}