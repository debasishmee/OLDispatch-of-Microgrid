import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { debounceTime } from 'rxjs/operators';

import firebase from 'firebase/compat/app';
import 'firebase/firestore';



import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public canvasHumidity: any;                             // HTML canvas
  public ctxHumidity: any;                                // context for the HTML canvas
  public chartHumidity: any;                              // chart object for Chart.js

  public canvasHumidity1: any;                             // HTML canvas
  public ctxHumidity1: any;                                // context for the HTML canvas
  public chartHumidity1: any;   

  public canvasHumidity2: any;                             // HTML canvas
  public ctxHumidity2: any;                                // context for the HTML canvas
  public chartHumidity2: any;  

  public canvasHumidity3: any;                             // HTML canvas
  public ctxHumidity3: any;                                // context for the HTML canvas
  public chartHumidity3: any;  

  public canvasHumidity4: any;                             // HTML canvas
  public ctxHumidity4: any;                                // context for the HTML canvas
  public chartHumidity4: any;

  public humiditySensorReading: any;                      // form input of new sensor value
  public temperatureSensorReading: any;
  
  public historicalHumidity: any[];                       // stored data from Firebase (or hardcoded for testing)

  public currentSensorReadings: any;                      // current sensor readings for a given collection

  constructor(private firestore: AngularFirestore) {
      this.historicalHumidity = [];
  }

  ngOnInit(): void {
      this.initHumidityChart();

      let docNameCurrent = 'current';                                                                                 // only storing the current sensor readings
      let docNameHistoric = this.buildHistoricDocName();                                                              // storing an array of all sensor readings for the time bucket

      this.currentSensorReadings = this.firestore.collection('Mydata1').doc(docNameCurrent).valueChanges();      // attach to the observable so the html can be updated
      this.firestore.collection('Mydata1').doc(docNameCurrent).valueChanges().pipe(                              // pipe so we can have a callback to put the new readings in the chart
          debounceTime(200)                                                                                           // discard miltiple emitted values within n milliseconds
      )
          .subscribe((data: any) => {
             // if (data && data.hasOwnProperty('Generation_grid'))
                this.addDataToChart(this.chartHumidity, '', data['Generation_grid']);  // when the 'current' doc changes, place the new humidity value in the chart
             // if (data && data.hasOwnProperty('Dispatch_grid'))
                this.addDataToChart(this.chartHumidity1, '', data['Dispatch_grid']);   
              // when the 'current' doc changes, place the new humidity value in the chart
              //  this.addDataToChart1(this.chartHumidity1, '', data['Dispatch_grid']);
              this.addDataToChart(this.chartHumidity2, '', data['Generation_PV']);
              this.addDataToChart(this.chartHumidity3, '', data['Dispatch_PV']); 
              this.addDataToChart(this.chartHumidity4, '', data['Dispatch_PV']); 
          });

          

      console.log('docNameHistoric', docNameHistoric);
      this.firestore.collection('Mydata1').doc(docNameHistoric).ref.get().then((doc) => {        // get the current hour's historical readings just once (without an observable)
      }).catch((error) => {
          console.log('Error getting historical doc:', error);
      });

      this.randomizeSensorReadings();                     // set our form inputs to random values
  }

  initHumidityChart() {
      this.canvasHumidity = document.getElementById('chartHumidity');
      this.ctxHumidity = this.canvasHumidity.getContext('2d');
      this.chartHumidity = new Chart(this.ctxHumidity, {
          type: 'line',
          data: {
              // labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
              labels: [],
              datasets: [{
                  label: 'Generation from grid',
                  data: [],
                  fill: false,
                  borderColor: 'rgb(51, 104, 255)',
                  tension: 0.1
              }]
          },
          options: {
              scales: {
                  y: {
                      beginAtZero: true
                  }
              }
              
          }
          
      });

      this.canvasHumidity1 = document.getElementById('chartHumidity1');
      this.ctxHumidity1 = this.canvasHumidity1.getContext('2d');
      this.chartHumidity1 = new Chart(this.ctxHumidity1, {
          type: 'line',
          data: {
              // labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
              labels: [],
              datasets: [{
                  label: 'Dispatch from grid',
                  data: [],
                  fill: false,
                  borderColor: 'rgb(51, 104, 255)',
                  tension: 0.1
              }]
          },
          options: {
              scales: {
                  y: {
                      beginAtZero: true
                  }
              }
          }
      });

      this.canvasHumidity2 = document.getElementById('chartHumidity2');
      this.ctxHumidity2 = this.canvasHumidity2.getContext('2d');
      this.chartHumidity2 = new Chart(this.ctxHumidity2, {
          type: 'line',
          data: {
              // labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
              labels: [],
              datasets: [{
                  label: 'Generation from PV',
                  data: [],
                  fill: false,
                  borderColor: 'rgb(51, 104, 255)',
                  tension: 0.1,

              }],
          },
          options: {
              scales: {
                  y: {
                      beginAtZero: true
                  }
              }
          }
      });
      this.canvasHumidity3 = document.getElementById('chartHumidity3');
      this.ctxHumidity3 = this.canvasHumidity3.getContext('2d');
      this.chartHumidity3 = new Chart(this.ctxHumidity3, {
          type: 'line',
          data: {
              // labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
              labels: [],
              datasets: [{
                  label: 'Profit Chart',
                  data: [],
                  fill: false,
                  borderColor: 'rgb(51, 104, 255)',
                  tension: 0.1
              }]
          },
          options: {
              scales: {
                  y: {
                      beginAtZero: true
                  }
              }
          }
      });

      this.canvasHumidity4 = document.getElementById('chartHumidity4');
      this.ctxHumidity4 = this.canvasHumidity4.getContext('2d');
      this.chartHumidity4 = new Chart(this.ctxHumidity4, {
          type: 'pie',
          data: {
              // labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
              labels: [],
              datasets: [{
                label: 'My First Dataset',
                data: [],
                backgroundColor: [
                  'rgb(255, 99, 132)',
                  'rgb(54, 162, 235)',
                  'rgb(255, 205, 86)'
                ],
                hoverOffset: 4
              }]
          },
          
      });
  }

  randomizeSensorReadings() {
      this.humiditySensorReading = this.generateRandomInt(0, 100);
      this.temperatureSensorReading = this.generateRandomInt(60, 80);
  }

  generateRandomInt(min: number, max: number) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1) + min);
  }

  insertData() {
      let docNameCurrent = 'current';                                             // only storing the current sensor readings
      let docNameHistoric = this.buildHistoricDocName();                          // storing an array of all sensor readings for the time bucket

      this.firestore.collection('Mydata1').doc(docNameCurrent)
          .set({
              'humidity': this.humiditySensorReading,
              'temperature': this.temperatureSensorReading,
              'timestamp': firebase.firestore.Timestamp.now()
          });

      this.firestore.collection('Mydata1').doc(docNameHistoric)
          .set({
              'historicalMeasurements': firebase.firestore.FieldValue.arrayUnion({
                  'humidity': this.humiditySensorReading,
                  'temperature': this.temperatureSensorReading,
                  'timestamp': firebase.firestore.Timestamp.now()
              })
          },
              { merge: true });                                                   // provides an update and creates the doc if it doesn't exist

      this.randomizeSensorReadings();                                             // generate new random values for next time
  }

  buildHistoricDocName() {
      let now = new Date();

      let year = now.getFullYear();
      let month = (now.getMonth() + 1) + '';                                          // javascript months are zero-based, so add 1
      let day = now.getDate() + '';
      let hour = now.getHours() + '';

      if (month.length < 2)
          month = '0' + month;
      if (day.length < 2)
          day = '0' + day;
      if (hour.length < 2)
          hour = '0' + hour;
      hour = 'h' + hour;

      return [year, month, day, hour].join('_');                                      // ex: '2021_05_13_h09'
  }

  addDataToChart(chart: { data: { labels: any[]; datasets: any[]; }; update: () => void; }, label: string, data: string) {
      console.log('chart - ' + data);
      chart.data.labels.push(label);
      chart.data.datasets.forEach((dataset) => {
          dataset.data.push(data);
      });
      chart.update();
  }
}
