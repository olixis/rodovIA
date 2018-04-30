import { Component, ViewChild } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';
import { Gyroscope, GyroscopeOrientation, GyroscopeOptions } from '@ionic-native/gyroscope';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Geolocation } from '@ionic-native/geolocation';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Clipboard } from '@ionic-native/clipboard';
import { File } from '@ionic-native/file'; 
import { ToastController } from 'ionic-angular';


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
public acc:any;
private database:SQLiteObject;
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
public runID:any = null;
public sessionRunIDS: string[] = [];
public headingAcc:any;
private config:any;
private conn:WebSocket = null;

  constructor(public navCtrl: NavController,private platform: Platform,private deviceMotion: DeviceMotion,private geolocation: Geolocation
    ,private deviceOrientation: DeviceOrientation,private file: File,private sqlite: SQLite,private gyroscope: Gyroscope,private backgroundMode: BackgroundMode,private clipboard: Clipboard,private toastCtrl: ToastController) {

    platform.ready().then(() => {
      this.backgroundMode.enable();
      alert(file.externalApplicationStorageDirectory)
      sqlite.create({
        name: 'dados.db',
        location: 'default'
        })
        .then((db: SQLiteObject) => {
            this.database = db;
            db.executeSql('CREATE TABLE IF NOT EXISTS accel (id INTEGER PRIMARY KEY AUTOINCREMENT,xaxisaccel DOUBLE,yaxisaccel DOUBLE,zaxisaccel DOUBLE,date DOUBLE);', {})
            .then(() => alert('SQLite Funcionando para tabela accel'))
            .catch(e => alert(e.message));
            db.executeSql('CREATE TABLE IF NOT EXISTS geoloc (id INTEGER PRIMARY KEY AUTOINCREMENT,long DOUBLE,lat DOUBLE,acc DOUBLE,altitude DOUBLE,speed DOUBLE,date DOUBLE);', {})
            .then(() => alert('SQLite Funcionando para tabela geoloc'))
            .catch(e => alert(e.message));

        })
        .catch(e => alert(e.message));

        
        let AccelSub = this.deviceMotion.watchAcceleration({frequency:1000}).subscribe((acceleration: DeviceMotionAccelerationData) => {
        this.accelValueX = (acceleration.x/9.80665);
        this.accelValueY = (acceleration.y/9.80665);
        this.accelValueZ = (acceleration.z/9.80665);
        // if(this.runID && this.conn && this.conn.readyState === this.conn.OPEN){
          // this.conn.send(JSON.stringify({accelValueX:this.accelValueX,accelValueY:this.accelValueY,accelValueZ:this.accelValueZ,timestamp:acceleration.timestamp,ptype:"accel",runID:this.runID}));
        // }

        
         this.database.executeSql("INSERT INTO accel (xaxisaccel,yaxisaccel,zaxisaccel, date) VALUES (?,?,?,?);", [this.accelValueX,this.accelValueY,this.accelValueZ,acceleration.timestamp])
                     .then()
                     .catch(e => alert(e.message));      
        });
        
        

        let geoLocationSub = this.geolocation.watchPosition({enableHighAccuracy: true}).subscribe(position => {
        this.long = position.coords.longitude;
        this.lat =  position.coords.latitude;
        this.acc = position.coords.accuracy;
        this.altitude = position.coords.altitude;
        this.altitudeAcc = position.coords.altitudeAccuracy;
        this.speed = position.coords.speed;
        // if(this.runID && this.conn && this.conn.readyState === this.conn.OPEN){
          // this.conn.send(JSON.stringify({longitude:position.coords.longitude,latitude:position.coords.latitude,accuracy:position.coords.accuracy,altitude:position.coords.altitude,altitudeAccuracy:position.coords.altitudeAccuracy,speed:position.coords.speed,timestamp:position.timestamp,ptype:"geo",runID:this.runID}));
        // }
         this.database.executeSql("INSERT INTO geoloc (long,lat,acc,altitude,speed,date) VALUES (?,?,?,?,?,?);", [position.coords.longitude,position.coords.latitude,position.coords.accuracy,position.coords.altitude,position.coords.altitudeAccuracy,position.coords.speed])
         .then()
         .catch(e => alert(e.message));  
        }); 

        let headingSub = this.deviceOrientation.watchHeading().subscribe(
                                (data: DeviceOrientationCompassHeading) => {
                                this.heading = data.magneticHeading;
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

  createGenericToast(message : string ,duration,position : string){
    return this.toastCtrl.create({
      message: message,
      duration: duration,
      position: position
    });
  }

  copySessionRunIds(){
    this.clipboard.copy(this.sessionRunIDS.toString()).then(
      () => this.createGenericToast("Ids copiados para a área de transferencia!",3000,"bottom")
      .present()
    );
  }
  
  connectWebsocket() {
    let that = this;
    this.platform.ready().then(() => {
      if(!this.conn){
        this.conn = new WebSocket('ws://159.65.74.104:7171');
        this.conn.onopen = function () { 
          alert("Conectado com o servidor. Enviando dados!");
          this.send(JSON.stringify({ptype:"rrunID"}))        
        };
        this.conn.onmessage = function (msg) {
          var data;
          //accepting only JSON messages 
          try {
              data = JSON.parse(msg.data);
          } catch (e) {
              alert("Invalid JSON");
              data = {};
          }
          switch(data.ptype){
            case "rrunID":
            that.runID = data.runID;
            that.sessionRunIDS.push(that.runID);
            alert("Seu id de corrida é: " + data.runID);
            break;
          }
        }
        this.conn.onclose = function () {
          alert("Conexão Encerrada.")
          that.conn = null;  
          that.runID = null; 
        }
      }
      else{
        alert("Você já esta conectado ao servidor!")
      }    
    })
  }
  closeWebsocket(){
    if(this.conn.readyState === this.conn.OPEN){
      this.conn.close();
      this.conn = null;  
      this.runID = null;    
    }
  }
  selectGeral(){
    this.database.executeSql("SELECT * from accel;",{})
    .then(resultado => alert(resultado.rows.item(0).xaxisaccel))
    .catch(e => alert(e.message));      

  }

}
