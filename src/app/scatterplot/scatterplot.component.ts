import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import {exampleData} from './example-data';

@Component({
  selector: 'scatterplot',
  templateUrl: './scatterplot.component.html',
  styleUrls: ['./scatterplot.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ScatterplotComponent implements OnInit, OnChanges {

  @ViewChild('chart') private chartContainer: ElementRef;
  @Input() private data: Array<any>;
  private margin: any = {top: 30, right: 20, bottom: 28, left: 60};
  private chart: any;
  private width: number;
  private height: number;
  private xScale: any;
  private yScale: any;
  private colors: any;
  private xAxis: any;
  private yAxis: any;
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

  public gridVisible: boolean;
  public selectedStudentIds: any = ["Average"];

  constructor() { }

  ngOnInit() {    
    /* change this to not reference example data */    
    this.data = exampleData;
    this.height = 500;
    this.width = 1000;
    this.createChart();
    this.gridVisible = false; 
    this.setStudentNames();   
    this.updateChart();
  }

  ngOnChanges(){

  }

  createChart(){
    let element = this.chartContainer.nativeElement;    
    let width = this.width;
    let height = this.height;
    let mydata = this.data;
    let margin = this.margin;
   
    
    this.svg = d3.select(element).append('svg')
      .attr('width', width)
      .attr('height', height);

    this.xScale = d3.scaleLinear().range([margin.left, width - margin.right]).domain([1.1,4.3]);
    this.yScale = d3.scaleLinear().range([height - margin.top, margin.bottom]).domain([0,5]);
    let xAxis = d3.axisBottom(this.xScale);
    let yAxis = d3.axisLeft(this.yScale);
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.x = d3.scaleTime().range([0, width]);
    this.y = d3.scaleLinear().range([height, 0]);

    //chart plot area
     this.svg.append('g')      
      .attr("transform", "translate(0," + (height - margin.bottom) + ")")
      .call(xAxis);

     this.svg.append('g')
      .attr("transform", "translate(" + (margin.left) + ",0)")
      .call(yAxis);   
               
  } 

  removeLines(){
    if(!this.lines){return;} 
    let i = 0;       
    for(var studentId in this.lines){
      var inArray = this.selectedStudentIds.indexOf(studentId);
      if(inArray == -1){        
        this.lines[studentId].remove();        
        delete this.lines[studentId];
      }
      else{
        console.log(`Index of ${studentId}: `+this.lines.indexOf(studentId));
      }
      i++;
    }
  } 

  updateChart(){
    this.removeLines();     
    if(!this.selectedStudentsData){ return; }    
    this.updateLineChart();               
  }

  updateLineChart(){
    return new Promise((resolve)=>{
      this.dataGroup = d3.nest()
        .key(function(d){
          return d["student"];
        })
    .entries(this.selectedStudentsData);
    
    let x = this.x;
    let y = this.y;
    let xScale = this.xScale;
    let yScale = this.yScale;
    let colors = ["blue", "red", "green"]; 
    var lineGen = d3.line()
      .x(function(d) {
        return xScale(d["year"]);
      })
      .y(function(d) {
        return yScale(d["avgScore"]);
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
        var line = svg.append('svg:path')
        .attr('d', lineGen(d.values))
        .attr('stroke', colors[i])
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
        
      }               
    },this);
      
      return resolve();
    });
  } 

  updateScatterPlots(d:any){
    return new Promise((resolve)=>{
      let svg = this.svg;      
      let width = this.width;
      let height = this.height;      
      let xAxis = this.xAxis;
      let yAxis = this.yAxis;       
      var color = d3.scaleOrdinal(d3.schemeCategory10);
      let margin = this.margin;      
      let xScale = d3.scaleLinear().range([margin.left, width - margin.right]).domain([1.1,4.3]);
      let yScale = d3.scaleLinear().range([height - margin.top, margin.bottom]).domain([0,5]);      
      
      let dataScatter = this.setDataScatter(d);        
      svg.selectAll("circle")
        .data(dataScatter)
        .enter().append("circle")
        .attr("class", "dot")        
        .attr("r", 3.5)              
        .attr("cx", function (d,i) { return xScale(d[0]); } )
        .attr("cy", function (d) { return yScale(d[1]); } )
        .style("fill", function(d) { return color("fee"); });      

      return resolve(true);     
      });    
    
  }

  setDataScatter(studentData){
    console.log(studentData);   
    let retVal = [];
    for(let key in studentData.values){
      let item =  (studentData.values[key]);
      let scores = item.scores;
      let year = item.year;
      let scoreArray = [];
      if(!scores){ continue;}
      for(let i=0; i<scores.length; i++){
        scoreArray[0] = year;
        scoreArray[1] = scores[i];
        retVal.push(scoreArray);
      }
    }
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

