import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import * as d3 from 'd3';
import {exampleData} from './example-data';

@Component({
  selector: 'scatterplot',
  templateUrl: './scatterplot.component.html',
  styleUrls: ['./scatterplot.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScatterplotComponent implements OnInit, OnChanges {

  @ViewChild('chart') private chartContainer: ElementRef;
  @Input() public data: Array<any> = [];
  @Input() public width: number;
  @Input() public height: number;
  @Input() public xMin: number;
  @Input() public xMax: number; 
  @Input() public xLabel: string;
  @Input() public yMin: number;
  @Input() public yMax: number;
  @Input() public yLabel: string;
  @Input() public colorScheme: any;
  @Input() public showLegend: boolean;

  private margin: any = {top: 30, right: 20, bottom: 28, left: 30};
  private chart: any;
  private xScale: any;
  private yScale: any;
  private colors: any;
  private xAxis: any;
  private yAxis: any;
  private svgXAxis: any;
  private svgYAxis: any;
  private svgXLabel: any;
  private svgYLabel: any;
  private svg: any;
  private x: any;
  private y: any;
  private dataGroup: any;
  private gY:any;
  private gX: any;
  public studentNames: any;
  private selectedStudents: any;
  private selectedStudentsData: any;
  private lines: any = [];
  private dotSelect: any = [];  
  private color: any;
  private assignedColors: any = []; 

  public gridVisible: boolean;
  public selectedStudentIds: any = ["Average"];

  constructor() { }

  ngOnInit() {    
    /* change this to not reference example data */    
    this.data = exampleData;
    this.height = this.height || 500;   
    this.width = this.width || 500;
    this.xMin = this.xMin || 0;
    this.xMax = this.xMax || 100;
    this.yMin = this.yMin || 0;
    this.yMax = this.yMax || 100;
    this.showLegend = this.showLegend || true;
    this.colorScheme = this.colorScheme || ["#666600", "#999900", "#996800", "#3399FF", "#990033", "#006600", "#0066CC", "#FFCC33" ];
    this.createChart();
    this.gridVisible = false; 
    this.setStudentNames();   
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges){
    for(let key in changes){      
      if((key == "xMax" || key == "xMin" || key == "yMin" || key == "yMax") && this.svgXAxis && this.svgYAxis){
        this.createAxis();
        this.redrawLines();
        this.updateGrid();
      }
      else if(key == "xLabel" || key == "yLabel"){        
        this.updateLabels();
      }
    }
  }

  updateLabels(){
    if(this.svgXLabel){
      this.svgXLabel.remove();
    }
    if(this.svgYLabel){
      this.svgYLabel.remove();
    }
    let x = (this.width/2).toFixed();
    let y = this.height-20;
    let self = this;
    if(this.xLabel){
       this.svgXLabel = this.svg.append("text")
      .attr("x", x)
      .attr("y", y)  
      .style("text-anchor", "middle")    
      .text(self.xLabel);
    }
   
  }

  createChart(){
    let self = this;
    let element = this.chartContainer.nativeElement;  
    this.svg = d3.select(element).append('svg')
      .attr('width', self.width)
      .attr('height', self.height);
    this.createAxis();            
  } 

  createAxis(){
    let self = this;
    this.xScale = d3.scaleLinear().range([self.margin.left, self.width - self.margin.right]).domain([self.xMin, self.xMax]);
    this.yScale = d3.scaleLinear().range([self.height - self.margin.top, self.margin.bottom]).domain([self.yMin, self.yMax]);
    //chart plot area
    let xAxis = d3.axisBottom(this.xScale);
    let yAxis = d3.axisLeft(this.yScale);
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.x = d3.scaleTime().range([0, self.width]);
    this.y = d3.scaleLinear().range([self.height, 0]);
    
    if(this.svgXAxis){
      this.svgXAxis.remove();
    }
    if(this.svgYAxis){
      this.svgYAxis.remove();
    }

    this.svgXAxis = self.svg.append('g')      
      .attr("transform", "translate(0," + (self.height - self.margin.bottom) + ")")
      .call(xAxis);

    this.svgYAxis = self.svg.append('g')
      .attr("transform", "translate(" + (self.margin.left) + ",0)")
      .call(yAxis);
  }

  removeDataPoints(){
    if(!this.lines){return;} 
    let i = 0;       
    for(var studentId in this.lines){
      var inArray = this.selectedStudentIds.indexOf(studentId);
      if(inArray == -1){        
        this.lines[studentId].remove(); 
        this.removeDots(studentId);       
        delete this.lines[studentId];
      }
      else{
        console.log(`Index of ${studentId}: `+this.lines.indexOf(studentId));
      }
      i++;
    }
  } 

  removeDots(studentId){
    let sel = this.dotSelect[studentId];    
    d3.selectAll("circle").remove();
  }

  updateChart(){
    this.removeDataPoints();     
    if(!this.selectedStudentsData){ return; }    
    this.updateLineChart();               
  }  

  updateLineChart(){
    let self = this;
    return new Promise((resolve)=>{
      this.dataGroup = d3.nest()
        .key(function(d){
          return d["student"];
        })
    .entries(this.selectedStudentsData);    
       
    var lineGen = d3.line()
      .x(function(d) {
        return self.xScale(d["year"]);
      })
      .y(function(d) {
        return self.yScale(self.getAverageScore(d));
      });
    let svg = this.svg;
    var _lines = [];
    let current_lines = this.lines;  
    
    var t = svg.transition()
            .duration(500)
            .ease(d3.easeLinear);           

    this.dataGroup.forEach(function(d, i) {                 
      let inArray = (d.key in this.lines);           
      if(!inArray){        
        this.assignedColors[d.key] = this.getColor();        
        self = this;                  
        var line = svg.append('svg:path')
        .attr('d', lineGen(d.values))
        .attr('stroke', self.assignedColors[d.key])
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('id', d.key)
        .attr("stroke-dasharray", function(d){ return this.getTotalLength() })
        .attr("stroke-dashoffset", function(d){ return this.getTotalLength() }); 
        line.transition(t)
          .attr("stroke-dashoffset", 0);
        line.id = d.key;
        _lines[line.id] = line; 
        this.lines[line.id] = line;             
        this.updateScatterPlots(d);          
      } 
      else{
        this.updateScatterPlots(d);
      }               
    },this);      
      return resolve();
    });
  } 

  updateLegend(){
    if(this.showLegend){

    }
  }

  redrawLines(){
    let self = this;
    if(!this.lines){return;} 
           
    for(var studentId in this.lines){              
        this.lines[studentId].remove(); 
        this.removeDots(studentId);       
        delete this.lines[studentId];    
    } 
    this.assignedColors = [];
    this.updateChart();   
  }

  getColor(){    
    let q = 0;
    for(let i=0; i<this.colorScheme.length; i++){
      let color = this.colorScheme[i];
      let position = Object.keys(this.assignedColors).map(function(e){
        return e.indexOf(color);
      });
      console.log(position);
    }
    for(let key in this.assignedColors){
      q++;
    }    
    return this.colorScheme[q];
  }

  getAverageScore(d){   
    if(!d["scores"]){ return d["avgScore"];} 
    let scores = d["scores"];
    return  (scores.reduce((a, b)=>{ return a+b;}))/scores.length.toFixed(1);      
  }

  updateScatterPlots(d:any){    
    return new Promise((resolve)=>{
      let self = this;
      let svg = this.svg;      
      let width = this.width;
      let height = this.height;      
      let xAxis = this.xAxis;
      let yAxis = this.yAxis;  
      let xMin = this.xMin;
      let xMax = this.xMax;
      let yMin = this.yMin;
      let yMax = this.yMax;    
      var color = this.assignedColors[d.key];
      let margin = this.margin;      
      let xScale = d3.scaleLinear().range([margin.left, width - margin.right]).domain([xMin, xMax]);
      let yScale = d3.scaleLinear().range([height - margin.top, margin.bottom]).domain([yMin, yMax]);      
      
      let dataScatter = this.setDataScatter(d);        
      var sel = svg.selectAll("circles "+d.key)
        .data(dataScatter);
     
      sel
        .enter().append("circle")
        .attr("class", ".dot")        
        .attr("r", 3.5)              
        .attr("cx", function (d,i) { return xScale(d[0]); } )
        .attr("cy", function (d) { return yScale(d[1]); } ) 
        .on("mouseover", function(d){ })           
        .style("fill", color);    
      this.dotSelect[d.key] = sel;
      return resolve(true);     
      });    
    
  } 

  setDataScatter(studentData){      
    let retVal = [];
    let q = 0;
    for(let key in studentData.values){
      let item =  (studentData.values[key]);
      let scores = item.scores;      
      let year = item.year;      
      if(!scores){ continue;}
      for(let i=0; i<scores.length; i++){
        let scoreArray = new Array(year, scores[i]);        
        retVal[q] = scoreArray;
        q++;
      }     
    }
    console.log(retVal);
    return retVal;
  }

  updateSelectedStudents(studentIds){
    this.selectedStudentIds = studentIds;    
    let studentData = []; 
    this.selectedStudentsData = null;  
    return new Promise((resolve)=>{
      this.data.forEach((item, index)=>{
        if(studentIds.indexOf(item.student) != -1){          
          studentData.push(item);
        }
      });      
      this.selectedStudentsData = studentData;      
      return resolve();
    });   
  }

  updateGrid(){  
    let svg = this.svg;
    let xScale = this.xScale;
    let yScale = this.yScale; 
    let y = this.y;
    let x = this.x;  
    if(this.gridVisible){
      if(this.gY){ this.gY.remove();}
      if(this.gX){ this.gX.remove(); }
      let width = this.width;
      let height = this.height - this.margin['bottom'];
      let numberOfTicks = 5;        
      var yAxis = d3.axisLeft(yScale).tickSize(-width).tickPadding(10).tickFormat(d3.timeFormat(""));
      var xAxis = d3.axisBottom(xScale).tickSize(-height).tickPadding(10).tickFormat(d3.timeFormat(""));
      this.gY = svg.append("g")
                  .attr("class", "gridX")                  
                  .attr("transform", `translate(${this.margin['left']},0)`).call(yAxis); 
      this.gX = svg.append("g")
                  .attr("class", "gridY")                  
                  .attr("transform", `translate(0, ${height})`).call(xAxis);      
    }
    else{
      this.gY.attr("display", "none");
      this.gX.attr("display", "none");
    }
  } 

  setStudentNames(){
    let data = this.data;
    let studentNames = [];
    data.forEach((item, i)=>{
      if(studentNames.indexOf(item.student) === -1){
        studentNames.push(item.student);
      }
    });
    this.studentNames = studentNames.sort();    
  }
}

