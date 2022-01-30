import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MqttModule, IMqttServiceOptions } from 'ngx-mqtt';
import { FormsModule } from '@angular/forms';
import { IonicStorageModule } from '@ionic/storage-angular';
import { JwtInterceptor } from './interceptors/jwt.interceptor';

export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  connectOnCreate: false
}
/*
  hostname: '192.168.1.200',        // replace by MQTT broker IP address
  username : 'loxberry', // replace by MQTT broker username
  password : '5T9ZYSSvZWs03QMh', // replace by MQTT broker password
  port: 9001,            // Mosquitto WebSocket port
  path: ''
  */

@NgModule({
  declarations: [
    AppComponent
  ],
  entryComponents: [
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      animated: false,     // disable page transitions
      rippleEffect: false  // disble ripple effect for buttons
    }),
    AppRoutingModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
    HttpClientModule,
    FormsModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [
    AppComponent
  ],
})
export class AppModule {}
