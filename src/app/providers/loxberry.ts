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
  
  // TODO move to app configuration
  private registered_topic_prefix = 'loxberry/app';

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
    this.registerTopic(this.registered_topic_prefix+'/settings/json');
  }

  private findTopic(data: any, val:string) {
    for(var i = 0; i < data.length; i++) { // loop through array index (1st level only)
      if (data[i].topic === val) return i;
    }
    return -1; // topic not found
  }

  private registerTopic(topic: string) {
    this.subscription.push( this._mqttService.observe(topic)
      .subscribe((message: IMqttMessage) => {
        var mqtt_topic = message.topic.substring(0, message.topic.length - 5); // trim last characters from string
        var msg = message.payload.toString();
        if (msg.length == 0 )
          this.flushData();
        else
          this.ProcessJSON(JSON.parse(msg));
    }));
  }

  private flushData() {
    this.controls = [];
    this.categories = [];
    this.rooms = [];

    this._controls.next(this.controls); 
    this._categories.next(this.categories); 
    this._rooms.next(this.rooms); 
  }

  // TODO: only items will be added, not removed. 
  // To remove items, flush the entire dataset first, and add the required items 
  private ProcessJSON(obj: any) {
    if (!obj) return;

    obj.controls.forEach( item => {
      var idx = this.findTopic(obj.controls, item.topic);
      if (idx >= 0) { // Item exists
        this.controls[idx] = item; // Override full object in array
        this.controls[idx].state.message = util.format(item.state.format, item.state.value);
       }
      else { // New item
        var control = item;
        control.state.message = util.format(item.state.format, item.state.value);
        this.controls.push(control); // Add new object to array
      }
    });

    obj.categories.forEach( item => {
      var idx = this.findTopic(obj.categories, item.topic);
      if (idx >= 0) { // Item exists
        this.categories[idx] = item; // Override full object in array
       }
      else { // New item
        this.categories.push(item); // Add new object to array
      }
    });

    obj.rooms.forEach( item => {
      var idx = this.findTopic(obj.rooms, item.topic);
      if (idx >= 0) { // Item exists
        this.rooms[idx] = item; // Override full object in array
       }
      else { // New item
        this.rooms.push(item); // Add new object to array
      }
    });

    this._controls.next(this.controls); 
    this._categories.next(this.categories); 
    this._rooms.next(this.rooms); 

    var control_sub_topics = [ "/name", "/icon/name", "/icon/href", "/icon/color",
       "/type", "/category", "/room", "/is_favorite", "/is_visible", "/is_protected", "/order",
       "/state/value", "/state/format", "/state/color", "/state/message" ];
    var cat_room_sub_topics = [ "/name", "/icon/name", "/icon/href", "/icon/color", "/image",
      "/is_visible", "/is_protected", "/order" ];

    this.registerSubTopics(this.controls, this._controls, 'control', control_sub_topics);
    this.registerSubTopics(this.categories, this._categories, 'category', cat_room_sub_topics);
    this.registerSubTopics(this.rooms, this._rooms, 'room', cat_room_sub_topics);
  }

  
  private registerSubTopics(data: any, subject: any, domain_topic: string, sub_topics: string[]) {
    console.log('register...');
    sub_topics.forEach( element => { 
      var full_topic_name = this.registered_topic_prefix+'/'+domain_topic+'/+'+element; // note: whildcard included
      if (this.registered_topics.includes(full_topic_name)) {
        console.log("topic already exists and ignored:",full_topic_name );
        return;
      }
      this.registered_topics.push(full_topic_name);
      this.subscription.push( this._mqttService.observe(full_topic_name)
      .subscribe((message: IMqttMessage) => {
        var topic_received = message.topic.replace(this.registered_topic_prefix+'/'+domain_topic+'/', '').split('/');
        var idx = this.findTopic(data, domain_topic+'/'+topic_received[0]);
        var msg = message.payload.toString();

        // extract name of fields from MQTT topic name
        if (topic_received.length == 3) {
          data[idx][topic_received[1]][topic_received[2]] = msg;
          console.log('received: ',this.registered_topic_prefix+'/'+domain_topic+'/'+topic_received[0]+'/'+topic_received[1]+'/'+topic_received[2], msg);
        }
        else { 
          data[idx][topic_received[1]] = msg;
          console.log('received: ',this.registered_topic_prefix+'/'+domain_topic+'/'+topic_received[0]+'/'+topic_received[1], msg);
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

  public sendMessage(obj: any) {
    var idx = this.findTopic(this.controls, obj.topic);
    var topic_root = this.registered_topic_prefix+'/'+obj.topic;

    if (idx==-1) {
      console.log('Topic '+obj.topic+' not found. Nothing published.');
      return;
    }
    
    this._mqttService.unsafePublish(topic_root+'/state/value', obj.state.value, { qos: 1, retain: false });
    console.log('MQTT publish:', topic_root+'/state/value', obj.state.value);
  }

}