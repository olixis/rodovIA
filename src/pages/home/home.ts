import { Component, ViewChild } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';
import { Gyroscope, GyroscopeOrientation, GyroscopeOptions } from '@ionic-native/gyroscope';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { Geolocation } from '@ionic-native/geolocation'; 
// import { Chart } from 'chart.js'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

//   @ViewChild('barCanvas') barCanvas;
//   barChart: any;

public accelValueX:any;
public accelValueY:any;
public accelValueZ:any;
public lat:any;
public long:any;
public database:SQLiteObject;
public acc:any;
public altitude:any;
public altitudeAcc:any;
public heading:any;
public orientationX:any;
public orientationY:any;
public orientationZ:any;
public lastInsertionId:any;
public lastInsertion:any = {};
public speed:any;
public trueHeading:any;
public headingAcc:any;
private config:any;

  constructor(public navCtrl: NavController,private platform: Platform,private deviceMotion: DeviceMotion,private geolocation: Geolocation
    ,private deviceOrientation: DeviceOrientation,private sqlite: SQLite,private sqlitePorter: SQLitePorter,private gyroscope: Gyroscope) {


    platform.ready().then(() => {
        sqlite.create({
        name: 'dados.db',
        location: 'default'
        })
        .then((db: SQLiteObject) => {
            this.database = db;
            db.executeSql('CREATE TABLE IF NOT EXISTS accel (id INTEGER PRIMARY KEY,zaxisaccel REAL,date TEXT);', {})
            .then(() => alert('SQLite Funcionando para tabela accel'))
            .catch(e => alert(e.message));
            db.executeSql('CREATE TABLE IF NOT EXISTS geoloc (id INTEGER PRIMARY KEY,zaxisaccel REAL,date TEXT);', {})
            .then(() => alert('SQLite Funcionando para tabela geoloc'))
            .catch(e => alert(e.message));

        })
        .catch(e => alert(e.message));
        
        let AccelSub = this.deviceMotion.watchAcceleration({frequency:200}).subscribe((acceleration: DeviceMotionAccelerationData) => {
        this.accelValueX = (acceleration.x/9.80665);
        this.accelValueY = (acceleration.y/9.80665);
        this.accelValueZ = (acceleration.z/9.80665);
                this.database.executeSql("INSERT INTO accel (zaxisaccel, date) VALUES (?,?);", [this.accelValueZ,acceleration.timestamp])
                    .then((resultSet) => this.lastInsertionId = resultSet.rows.insertId)
                    .catch(e => alert(e.message));

        
        //   this.config.data.labels.push(new Date());
        //   this.config.data.datasets[0].data.push({
        // 			x: new Date(),
        // 			y: (acceleration.z/9.80665)
        //   });
        });
        
        

        let geoLocationSub = this.geolocation.watchPosition({enableHighAccuracy: false})
                                .subscribe(position => {
                                this.long = position.coords.longitude;
                                this.lat =  position.coords.latitude;
                                this.acc = position.coords.accuracy;
                                this.altitude = String(position.coords.altitude);
                                this.altitudeAcc = String(position.coords.altitudeAccuracy);
                                // this.heading = String(position.coords.heading);
                                this.speed = String(position.coords.speed);
        }); 

        let headingSub = this.deviceOrientation.watchHeading().subscribe(
                                (data: DeviceOrientationCompassHeading) => {
                                // this.trueHeading = data.trueHeading;
                                this.heading = data.magneticHeading;
                                // this.headingAcc = data.headingAccuracy;
                                }
        );
        let gyroSub = this.gyroscope.watch({frequency: 100})
                      .subscribe((orientation: GyroscopeOrientation) => {
                        this.orientationX = orientation.x
                        this.orientationY = orientation.y
                        this.orientationZ = orientation.z
                      });

    
    });





      



  }
  
  clicked() {
                //  this.database.executeSql("SELECT * FROM medicao;", [])
                // .then((resultSet) => this.lastInsertion = resultSet.rows.item(resultSet.rows.length-1))
                // .catch(e => alert(e.message));
                this.sqlitePorter.exportDbToSql(this.database).then(dbSql => alert(dbSql))
  }

  ionViewDidLoad() {
 
//       let config = {
 
//             type: 'line',
//             data: {
//                 labels: ["init"],
//                 datasets: [
//                     {
//                         label: "Device Acceleration",
//                         fill: false,
//                         lineTension: 0,
//                         backgroundColor: "rgba(75,192,192,0.4)",
//                         borderColor: "rgba(75,192,192,1)",
//                         borderCapStyle: 'butt',
//                         borderDash: [],
//                         borderDashOffset: 0.0,
//                         borderJoinStyle: 'miter',
//                         pointBorderColor: "rgba(75,192,192,1)",
//                         pointBackgroundColor: "#fff",
//                         pointBorderWidth: 1,
//                         drawLine: false,
//                         pointHoverRadius: 5,
//                         pointHoverBackgroundColor: "rgba(75,192,192,1)",
//                         pointHoverBorderColor: "rgba(220,220,220,1)",
//                         pointHoverBorderWidth: 1,
//                         pointRadius: 0.1,
//                         pointHitRadius: 0.1,
//                         data: [1],
//                         spanGaps: false,
//                     }
//                 ]
//             }, 
//             options: {
//               animation: {
//                   duration: 0, // general animation time
//               },
//               hover: {
//                   animationDuration: 0, // duration of animations when hovering an item
//               },
//               responsiveAnimationDuration: 0, // animation duration after a resize
//           }
 
//         }
//         this.config = config
//         this.barChart = new Chart(this.barCanvas.nativeElement, this.config );
   }

}
