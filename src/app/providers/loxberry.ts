import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { IMqttMessage, MqttService } from 'ngx-mqtt';

import { util } from 'node-forge' // TODO check package
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Control } from '../interfaces/control'

@Injectable({  
  providedIn: 'root'
})
export class LoxBerry {

  private subscription: Subscription[] = [];
  private controls: Control[];

  constructor(private http: HttpClient,
              private _mqttService: MqttService) {
  }

  public load(): any {
    if (this.controls) {
      return of(this.controls);
    } else {
      return this.http
        .get('assets/data/controls.json')
        .pipe(map(this.registerControls, this));
    }
  }

  private registerControls(controls: Control[]) {
    this.controls = controls;
    // loop through all controls
    this.controls.forEach( (control) => {
      console.log(control.id);
      // TODO: refactor in more efficient function
      this.subscription.push( this._mqttService.observe(control.id).subscribe((message: IMqttMessage) => {
        control.state.value = message.payload.toString();
        control.state.message = message.payload.toString();
        if (Number(control.state.value)) 
          control.state.value = Number(control.state.value);
        if (control.state.format.length)
          control.state.message = util.format(control.state.format,control.state.value);
      }));
      this.subscription.push( this._mqttService.observe(control.id+'/name').subscribe((message: IMqttMessage) => {
        control.name = message.payload.toString();
      }));
      this.subscription.push( this._mqttService.observe(control.id+'/icon/name').subscribe((message: IMqttMessage) => {
        control.icon.name = message.payload.toString();
      }));
      this.subscription.push( this._mqttService.observe(control.id+'/icon/color').subscribe((message: IMqttMessage) => {
        control.icon.color = message.payload.toString();
      }));
      this.subscription.push( this._mqttService.observe(control.id+'/icon/href').subscribe((message: IMqttMessage) => {
        control.icon.href = message.payload.toString();
      }));
      this.subscription.push( this._mqttService.observe(control.id+'/type').subscribe((message: IMqttMessage) => {
        control.type = message.payload.toString();
      }));
      this.subscription.push( this._mqttService.observe(control.id+'/room').subscribe((message: IMqttMessage) => {
        control.room = message.payload.toString();
      }));
      this.subscription.push( this._mqttService.observe(control.id+'/category').subscribe((message: IMqttMessage) => {
        control.category = message.payload.toString();
      }));
      this.subscription.push( this._mqttService.observe(control.id+'/is_favorite').subscribe((message: IMqttMessage) => {
        control.is_favorite = (message.payload.toString() === '1');
      }));
      this.subscription.push( this._mqttService.observe(control.id+'/is_visible').subscribe((message: IMqttMessage) => {
        control.is_visible = (message.payload.toString() === '1');
      }));
      this.subscription.push( this._mqttService.observe(control.id+'/is_protected').subscribe((message: IMqttMessage) => {
        control.is_protected = (message.payload.toString() === '1');
      }));
      this.subscription.push( this._mqttService.observe(control.id+'/priority').subscribe((message: IMqttMessage) => {
        control.priority = Number(message.payload.toString());
      }));
      this.subscription.push( this._mqttService.observe(control.id+'/state/value').subscribe((message: IMqttMessage) => {
        control.state.value = message.payload.toString();
        control.state.message = message.payload.toString();
        if (Number(control.state.value)) 
          control.state.value = Number(control.state.value);
        if (control.state.format.length)
          control.state.message = util.format(control.state.format,control.state.value);
        }));
      this.subscription.push( this._mqttService.observe(control.id+'/state/format').subscribe((message: IMqttMessage) => {
        control.state.format = message.payload.toString();
        if (control.state.format.length)
          control.state.message = util.format(control.state.format,control.state.value);
      }));
      this.subscription.push( this._mqttService.observe(control.id+'/state/color').subscribe((message: IMqttMessage) => {
        control.state.color = message.payload.toString();
      }));  

    }); //forEach

    return this.controls;
  }

  public unload() : void {
    console.log('unsubscribe topics..');
    this.subscription.forEach( (item) => { item.unsubscribe(); } );
  }

}