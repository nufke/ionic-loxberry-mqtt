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
  
  private registered_topics: string[] = [];
  
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

  private registerControlTopics(root_topic) {
    var sub_topics = [ "/name", "/icon/name", "/icon/href", "/icon/color",
    "/type", "/category", "/room", "/is_favorite", "/is_visible", "/is_protected", "/order",
    "/state/value", "/state/format", "/state/color", "/state/message" ];

    sub_topics.forEach( element => { 
      var full_topic_name = root_topic+element;
      if (this.registered_topics.includes(full_topic_name)) return;

      this.registered_topics.push(full_topic_name);
      this.subscription.push( this._mqttService.observe(full_topic_name)
      .subscribe((message: IMqttMessage) => {
        var idx = this.findTopic(root_topic);
        // extract name of fields from MQTT topic name
        var topic_received = message.topic.replace(this.controls[idx].topic+'/', '').split('/');
        if (topic_received.length==2) {
          //console.log("debug1: " , sub_topic, idx);
          this.controls[idx][topic_received[0]][topic_received[1]] = message.payload.toString();
        }
        else { 
          //console.log("debug2: " ,sub_topic, idx);
          this.controls[idx][topic_received[0]] = message.payload.toString();
        }
        this._controls.next(this.controls); // updates for Subscribers
      }));
      //console.log('registered to nested topic', full_topic_name);
      //console.log('registered topics', this.registered_topics); 
    });
    
           
  }

  private registerControlRootTopic() {
    this.subscription.push( this._mqttService.observe('loxberry/app/control/+/json')
      .subscribe((message: IMqttMessage) => {
        var root_topic = message.topic.substring(0, message.topic.length - 5); // trim last characters from string
        var obj = JSON.parse(message.payload.toString());
        this.addControl(obj, root_topic);
        //console.log('subscribed to root topic: ', root_topic);
        this.registerControlTopics(root_topic);
    }));
    return this.controls;
  }


  public unload() : void {
    console.log('unsubscribe topics..');
    this.subscription.forEach( (item) => { item.unsubscribe(); } );
  }

}