import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
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
  private controls: Control[] = [];

  private _controls: BehaviorSubject<Control[]> = new BehaviorSubject([]);

  public getControls() {
    return this._controls.asObservable();
  }

  constructor(private http: HttpClient,
              private _mqttService: MqttService) {
    this.registerControlTopic();
  }

  public findTopic(val:string) {
    for(var i = 0; i < this.controls.length; i++) { // loop through array index (1st level only)
      if (this.controls[i].topic === val) return i;
    }
    return -1; // topic not found
  }

  private addControl(obj: any, topic: string) {
    var data = obj;
    var idx = this.findTopic(topic);
    console.log(idx);
    if (idx >= 0) {
      this.controls[idx] = obj; // Override full object in array
      this.controls[idx].state.message = util.format(obj.state.format, obj.state.value);
     }
    else {
      data.topic = topic;
      data.state.message = util.format(obj.state.format, obj.state.value);
      this.controls.push(data); // Add new object to array
    }
 
    this._controls.next(this.controls);
  }

  private registerControlTopic() {
    this.subscription.push( this._mqttService.observe('loxberry/app/control/+/json')
      .subscribe((message: IMqttMessage) => {
        var topic_str = message.topic.substring(0, message.topic.length - 5); // trim last characters from string
        var obj = JSON.parse(message.payload.toString());
        this.addControl(obj, topic_str);
        console.log('subscribed to ', topic_str, obj);
    }));
    
     /*
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
*/
    return this.controls;
  }

  public unload() : void {
    console.log('unsubscribe topics..');
    this.subscription.forEach( (item) => { item.unsubscribe(); } );
  }

}