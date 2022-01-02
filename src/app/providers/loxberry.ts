import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { util } from 'node-forge' // TODO check package
import { Control, Category, Room } from '../interfaces/datamodel'

@Injectable({  
  providedIn: 'root'
})
export class LoxBerry {

  private subscription: Subscription[] = [];
  private controls: Control[] = [];
  private _controls: BehaviorSubject<Control[]> = new BehaviorSubject([]);

  private categories: Category[] = [];
  private _categories: BehaviorSubject<Category[]> = new BehaviorSubject([]);

  private rooms: Room[] = [];
  private _rooms: BehaviorSubject<Room[]> = new BehaviorSubject([]);
  
  private registered_topics: string[] = [];
  
  public getControls() {
    return this._controls.asObservable();
  }

  public getCategories() {
    return this._categories.asObservable();
  }

  public getRooms() {
    return this._rooms.asObservable();
  }


  constructor(private http: HttpClient,
              private _mqttService: MqttService) {
    this.registerTopic('loxberry/app/settings/json');
  }

  private findTopic(data: any, val:string) {
    for(var i = 0; i < data.length; i++) { // loop through array index (1st level only)
      if (data[i].topic === val) return i;
    }
    return -1; // topic not found
  }

  private registerTopic( topic: string) {
    this.subscription.push( this._mqttService.observe(topic)
      .subscribe((message: IMqttMessage) => {
        var mqtt_topic = message.topic.substring(0, message.topic.length - 5); // trim last characters from string
        var obj = JSON.parse(message.payload.toString());
        //console.log('received from root topic: ', mqtt_topic, obj);
        this.ProcessJSON(obj);
    }));
  }

  //TODO: more intelligent loading of JSON
  private ProcessJSON(obj: any) {
    if (!obj) return;
       
    this.controls = obj.controls;
    this.categories = obj.categories;
    this.rooms = obj.rooms;

    this._controls.next(this.controls); 
    this._categories.next(this.categories); 
    this._rooms.next(this.rooms); 

    var control_sub_topics = [ "/name", "/icon/name", "/icon/href", "/icon/color",
       "/type", "/category", "/room", "/is_favorite", "/is_visible", "/is_protected", "/order",
       "/state/value", "/state/format", "/state/color", "/state/message" ];
    var cat_room_sub_topics = [ "/name", "/icon/name", "/icon/href", "/icon/color",
      "/is_visible", "/is_protected", "/order" ];

    var root_topic = 'loxberry/app';
    this.registerSubTopics(this.controls, this._controls, root_topic, 'control', control_sub_topics);
    this.registerSubTopics(this.categories, this._categories, root_topic, 'category', cat_room_sub_topics);
    this.registerSubTopics(this.rooms, this._rooms, root_topic, 'room', cat_room_sub_topics);
  }

  private registerSubTopics(data: any, subject: any, root_topic: string, domain_topic: string, sub_topics: string[]) {

    sub_topics.forEach( element => { 
      var full_topic_name = root_topic+'/'+domain_topic+'/+'+element; // note: whildcard included
      if (this.registered_topics.includes(full_topic_name)) {
        console.log("topic already exists and ignored:",full_topic_name );
        return;
      }
      this.registered_topics.push(full_topic_name);
      this.subscription.push( this._mqttService.observe(full_topic_name)
      .subscribe((message: IMqttMessage) => {
        var topic_received = message.topic.replace(root_topic+'/'+domain_topic+'/', '').split('/');
        var idx = this.findTopic(data, domain_topic+'/'+topic_received[0]);
        console.log(root_topic+'/'+topic_received[0], idx);
        // extract name of fields from MQTT topic name
        if (topic_received.length == 3) {
          data[idx][topic_received[1]][topic_received[2]] = message.payload.toString();
        }
        else { 
          data[idx][topic_received[1]] = message.payload.toString();
        }
        subject.next(data); // updates for Subscribers
      }));
      console.log('register',full_topic_name);
    });  
  }

  public unload() : void {
    console.log('unsubscribe topics..');
    this.subscription.forEach( (item) => { item.unsubscribe(); } );
  }

}