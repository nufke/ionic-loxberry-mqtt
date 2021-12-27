import { Component, ViewChild } from '@angular/core';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { Subscription } from 'rxjs';
import { util } from 'node-forge' // TODO check package

// TODO move to interface object
interface control {
  topic: string,
  name: string,
  icon: {
    name: string,
    href?: string,
    color?: string
  }
  type: string,
  room: string,
  category: string,
  is_favorite?: Boolean,
  is_visible?: Boolean,
  is_protected?: Boolean,
  is_movable?: Boolean,
  priority?: number,
  state: {
    value: string | Number,
    format?: string,
    color?: string,
    message?: string // TODO move outside interface
  }
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  private subscription: Subscription[];

  public controls: control[];

  constructor(private _mqttService: MqttService) {
    this.controls = [ 
      {
        topic: 'test/sensor1',
        name: 'Sensor 1',
        icon: {name: 'bulb'},
        type: 'text',
        room: 'Living Room',
        category: 'Sensors',
        priority: 1,
        state: {
          value: 'waiting for value...',
          format: '%s'
        }
      }, 
      {
        topic: 'test/sensor2',
        name: 'Sensor 2',
        icon: {name: 'bulb'},
        type: 'text',
        room: 'Living Room',
        category: 'Sensors',
        priority: 2,
        state: {
          value: 'waiting for value...',
          format: '%s °C'
        }
      }, 
    ]; 
    this.subscription = [];
    console.log('subscribe topics..');
    this.registerControls();
  }

  public registerControls(): void {

    this.controls.forEach( (control) => {
      this.subscription.push( this._mqttService.observe(control.topic).subscribe((message: IMqttMessage) => {
        control.state.value = message.payload.toString();
      }));
      this.subscription.push( this._mqttService.observe(control.topic+'/name').subscribe((message: IMqttMessage) => {
        control.name = message.payload.toString();
      }));
      this.subscription.push( this._mqttService.observe(control.topic+'/icon/name').subscribe((message: IMqttMessage) => {
        control.icon.name = message.payload.toString();
      }));
      this.subscription.push( this._mqttService.observe(control.topic+'/icon/color').subscribe((message: IMqttMessage) => {
        control.icon.color = message.payload.toString();
      }));
      this.subscription.push( this._mqttService.observe(control.topic+'/icon/href').subscribe((message: IMqttMessage) => {
        control.icon.href = message.payload.toString();
      }));
      this.subscription.push( this._mqttService.observe(control.topic+'/type').subscribe((message: IMqttMessage) => {
        control.type = message.payload.toString();
      }));
      this.subscription.push( this._mqttService.observe(control.topic+'/room').subscribe((message: IMqttMessage) => {
        control.room = message.payload.toString();
      }));
      this.subscription.push( this._mqttService.observe(control.topic+'/category').subscribe((message: IMqttMessage) => {
        control.category = message.payload.toString();
      }));
      this.subscription.push( this._mqttService.observe(control.topic+'/is_favorite').subscribe((message: IMqttMessage) => {
        control.is_favorite = (message.payload.toString() === '1');
      }));
      this.subscription.push( this._mqttService.observe(control.topic+'/is_visible').subscribe((message: IMqttMessage) => {
        control.is_visible = (message.payload.toString() === '1');
      }));
      this.subscription.push( this._mqttService.observe(control.topic+'/is_protected').subscribe((message: IMqttMessage) => {
        control.is_protected = (message.payload.toString() === '1');
      }));
      this.subscription.push( this._mqttService.observe(control.topic+'/priority').subscribe((message: IMqttMessage) => {
        control.priority = Number(message.payload.toString());
      }));
      this.subscription.push( this._mqttService.observe(control.topic+'/state/value').subscribe((message: IMqttMessage) => {
        control.state.value = message.payload.toString();
        control.state.message = message.payload.toString();
        if (Number(control.state.value)) 
          control.state.value = Number(control.state.value);
        if (control.state.format.length)
          control.state.message = util.format(control.state.format,control.state.value);
        }));
      this.subscription.push( this._mqttService.observe(control.topic+'/state/format').subscribe((message: IMqttMessage) => {
        control.state.format = message.payload.toString();
        if (control.state.format.length)
          control.state.message = util.format(control.state.format,control.state.value);
      }));
      this.subscription.push( this._mqttService.observe(control.topic+'/state/color').subscribe((message: IMqttMessage) => {
        control.state.color = message.payload.toString();
      }));
    }); //forEach
  }

  public ngOnDestroy() : void {
    console.log('unsubscribe topics..');
    this.subscription.forEach( (item) => { item.unsubscribe(); } );
  }

  public sortControls() : control[] {
    return this.controls.sort( (a, b) => { return a.priority - b.priority });
  }

}