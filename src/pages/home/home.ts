import { Component, ViewChild } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';
import { Gyroscope, GyroscopeOrientation, GyroscopeOptions } from '@ionic-native/gyroscope';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { File } from '@ionic-native/file';
import { Geolocation } from '@ionic-native/geolocation'; 

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {


public accelValueX:any;
public accelValueY:any;
public accelValueZ:any;
public lat:any;
public long:any;
private fileSystem:File;
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
    ,private deviceOrientation: DeviceOrientation,private sqlite: SQLite,private sqlitePorter: SQLitePorter,private file: File,private gyroscope: Gyroscope) {
      this.fileSystem = file;

    platform.ready().then(() => {
      var conn = new WebSocket('ws://104.251.219.125:7171');
      conn.onopen = function () { 
        alert("websocket connected!");
     };
     conn.onmessage = function (msg) {
       console.log(msg);
     }
      // alert(file.externalApplicationStorageDirectory)
      //   sqlite.create({
      //   name: 'dados.db',
      //   location: 'default'
      //   })
      //   .then((db: SQLiteObject) => {
      //       this.database = db;
      //       db.executeSql('CREATE TABLE IF NOT EXISTS accel (id INTEGER PRIMARY KEY,xaxisaccel REAL,yaxisaccel REAL,zaxisaccel REAL,date TEXT);', {})
      //       .then(() => alert('SQLite Funcionando para tabela accel'))
      //       .catch(e => alert(e.message));
      //       db.executeSql('CREATE TABLE IF NOT EXISTS geoloc (id INTEGER PRIMARY KEY,long REAL,lat REAL,acc REAL,altitude REAL,speed REAL,date TEXT);', {})
      //       .then(() => alert('SQLite Funcionando para tabela geoloc'))
      //       .catch(e => alert(e.message));

      //   })
      //   .catch(e => alert(e.message));
        
        let AccelSub = this.deviceMotion.watchAcceleration({frequency:1000}).subscribe((acceleration: DeviceMotionAccelerationData) => {
        this.accelValueX = (acceleration.x/9.80665);
        this.accelValueY = (acceleration.y/9.80665);
        this.accelValueZ = (acceleration.z/9.80665);
                conn.send(JSON.stringify({accelValueX:this.accelValueX,accelValueY:this.accelValueY,accelValueZ:this.accelValueZ,timestamp:acceleration.timestamp,source:"accel"}));
                // this.database.executeSql("INSERT INTO accel (xaxisaccel,yaxisaccel,zaxisaccel, date) VALUES (?,?,?,?);", [this.accelValueX,this.accelValueY,this.accelValueZ,acceleration.timestamp])
                //     .then()
                //     .catch(e => alert(e.message));
        });
        
        

        let geoLocationSub = this.geolocation.watchPosition({enableHighAccuracy: true}).subscribe(position => {
        this.long = position.coords.longitude;
        this.lat =  position.coords.latitude;
        this.acc = position.coords.accuracy;
        this.altitude = position.coords.altitude;
        this.altitudeAcc = position.coords.altitudeAccuracy;
        // this.heading = String(position.coords.heading);
        this.speed = position.coords.speed;
        conn.send(JSON.stringify({longitude:position.coords.longitude,latitude:position.coords.latitude,accuracy:position.coords.accuracy,altitude:position.coords.altitude,altitudeAccuracy:position.coords.altitudeAccuracy,speed:position.coords.speed,timestamp:position.timestamp,source:"geo"}));
                // this.database.executeSql("INSERT INTO geoloc (long,lat,acc,altitude,speed,date) VALUES (?,?,?,?,?,?);", [position.coords.longitude,position.coords.latitude,position.coords.accuracy,position.coords.altitude,position.coords.altitudeAccuracy,position.coords.speed])
                //     .then()
                //     .catch(e => alert(e.message));                                
        }); 

        let headingSub = this.deviceOrientation.watchHeading().subscribe(
                                (data: DeviceOrientationCompassHeading) => {
                                // this.trueHeading = data.trueHeading;
                                this.heading = data.magneticHeading;
                                // this.headingAcc = data.headingAccuracy;
                                }
        );
        let gyroSub = this.gyroscope.watch({frequency: 1000})
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
                this.sqlitePorter.exportDbToSql(this.database).then(dbSql => this.fileSystem.createFile(this.fileSystem.externalDataDirectory,"db2.sqlite",true).then(fileEntry => alert(fileEntry.file.name + " salvo com sucesso!")).catch(e => alert(e.message)))
  }

}
