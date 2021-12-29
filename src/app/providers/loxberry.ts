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
    this.registerControlRootTopic();
  }

  private findTopic(val:string) {
    for(var i = 0; i < this.controls.length; i++) { // loop through array index (1st level only)
      if (this.controls[i].topic === val) return i;
    }
    return -1; // topic not found
  }

  private addControl(obj: any, topic: string) {
    var data = obj;
    var idx = this.findTopic(topic);
    if (idx >= 0) {
      this.controls[idx] = obj; // Override full object in array
      this.controls[idx].state.message = util.format(obj.state.format, obj.state.value);
     }
    else {
      data.topic = topic;
      data.state.message = util.format(obj.state.format, obj.state.value);
      this.controls.push(data); // Add new object to array
    }
    this._controls.next(this.controls); // updates for Subscribers
  }

  public registerControlTopics(obj, root_topic, root) {
    for(var key in obj){ 
       if (typeof obj[key] === "object") {
         this.registerControlTopics(obj[key], root_topic, key+'/')
       }
       else {
         if (key === 'topic' ) break;
         var nested_topic = root_topic+'/'+root+key;
         this.subscription.push( this._mqttService.observe(nested_topic)
           .subscribe((message: IMqttMessage) => {
             var idx = this.findTopic(root_topic);
             // extract name of fields from MQTT topic name
             var sub_topic = message.topic.replace(this.controls[idx].topic+'/', '').split('/');
             if (sub_topic.length==2) {
               //console.log("debug1: " , sub_topic, idx);
               this.controls[idx][sub_topic[0]][sub_topic[1]] = message.payload.toString();
             }
             else { 
               //console.log("debug2: " ,sub_topic, idx);
               this.controls[idx][sub_topic[0]] = message.payload.toString();
             }
             this._controls.next(this.controls); // updates for Subscribers
        }));
        //console.log('registered to nested topic', nested_topic);
      }
    }
  }

  private registerControlRootTopic() {
    this.subscription.push( this._mqttService.observe('loxberry/app/control/+/json')
      .subscribe((message: IMqttMessage) => {
        var root_topic = message.topic.substring(0, message.topic.length - 5); // trim last characters from string
        var obj = JSON.parse(message.payload.toString());
        this.addControl(obj, root_topic);
        //console.log('subscribed to root topic: ', root_topic);
        this.registerControlTopics(obj, root_topic,'');
    }));
    
    return this.controls;
  }

  public unload() : void {
    console.log('unsubscribe topics..');
    this.subscription.forEach( (item) => { item.unsubscribe(); } );
  }

}