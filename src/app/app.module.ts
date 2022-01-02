import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { MqttModule, IMqttServiceOptions } from 'ngx-mqtt';

export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: 'ip',        // replace by MQTT broker IP address
  username : 'username', // replace by MQTT broker username
  password : 'password', // replace by MQTT broker password
  port: 9001,            // Mosquitto WebSocket port
  path: ''
}

@NgModule({
  declarations: [
    AppComponent
  ],
  entryComponents: [
  ],
  imports: [
    BrowserModule, 
    IonicModule.forRoot({animated: false}), // disable page transition animation 
    AppRoutingModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
    HttpClientModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [
    AppComponent
  ],
})
export class AppModule {}
