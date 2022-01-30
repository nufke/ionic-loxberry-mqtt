import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { util } from 'node-forge' // TODO check package
import { Control, Category, Room } from '../interfaces/datamodel'
import { StorageService } from '../services/storage.service';

@Injectable({  
  providedIn: 'root'
})
export class LoxBerry {

  private subscription: Subscription[] = [];
  private controls: Control[] = [];
  private controlsSubject: BehaviorSubject<Control[]> = new BehaviorSubject([]);
  private categories: Category[] = [];
  private categoriesSubject: BehaviorSubject<Category[]> = new BehaviorSubject([]);
  private rooms: Room[] = [];
  private roomsSubject: BehaviorSubject<Room[]> = new BehaviorSubject([]);
 
  private registered_topics: string[] = [];
  
  private mqttUsername: string = '';
  private mqttPW: string = '';
  private mqttPort: string = '';
  private loxberryIP: string = '';

  // TODO move to app configuration
  private registered_topic_prefix = 'loxberry/app';

  public getControls() {
    return this.controlsSubject.asObservable();
  }

  public getCategories() {
    return this.categoriesSubject.asObservable();
  }

  public getRooms() {
    return this.roomsSubject.asObservable();
  }

  constructor(private http: HttpClient,
              private mqttService: MqttService,
              private storageService: StorageService) 
  {
    this.storageService.getSettings().subscribe( settings => { 
      if (settings) {
        this.loxberryIP = settings.loxberryIP;
        this.mqttUsername = settings.mqttUsername;
        this.mqttPort = settings.mqttPort;
        this.mqttPW = settings.mqttPW;
        this.connectToMqtt();
        this.registerTopic(this.registered_topic_prefix+'/settings/set');
      }
    });
  }

  private connectToMqtt() 
  {
    this.mqttService.connect(
    {
      username: this.mqttUsername,
      password: this.mqttPW,
      hostname: this.loxberryIP,
      port: Number(this.mqttPort)
    });
  }

  private findTopic(data: any, val:string) {
    for(let i = 0; i < data.length; i++) { // loop through array index (1st level only)
      if (data[i].topic === val) return i;
    }
    return -1; // topic not found
  }

  private registerTopic(topic: string) {
    this.subscription.push( this.mqttService.observe(topic)
      .subscribe((message: IMqttMessage) => {
        let mqtt_topic = message.topic.substring(0, message.topic.length - 5); // trim last characters from string
        let msg = message.payload.toString();
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

    this.controlsSubject.next(this.controls); 
    this.categoriesSubject.next(this.categories); 
    this.roomsSubject.next(this.rooms); 
  }

  // TODO: only items will be added, not removed. 
  // To remove items, flush the entire dataset first, and add the required items 
  private ProcessJSON(obj: any) {
    if (!obj) return;

    obj.controls.forEach( item => {
      let idx = this.findTopic(obj.controls, item.topic);
      if (idx >= 0) { // Item exists
        this.controls[idx] = item; // Override full object in array
        this.controls[idx].state._message = util.format(item.state.format, item.state.value);
       }
      else { // New item
        let control = item;
        control.state._message = util.format(item.state.format, item.state.value);
        this.controls.push(control); // Add new object to array
      }
    });

    obj.categories.forEach( item => {
      let idx = this.findTopic(obj.categories, item.topic);
      if (idx >= 0) { // Item exists
        this.categories[idx] = item; // Override full object in array
       }
      else { // New item
        this.categories.push(item); // Add new object to array
      }
    });

    obj.rooms.forEach( item => {
      let idx = this.findTopic(obj.rooms, item.topic);
      if (idx >= 0) { // Item exists
        this.rooms[idx] = item; // Override full object in array
       }
      else { // New item
        this.rooms.push(item); // Add new object to array
      }
    });

    this.controlsSubject.next(this.controls); 
    this.categoriesSubject.next(this.categories); 
    this.roomsSubject.next(this.rooms); 

    let control_sub_topics = [ "/name", "/icon/name", "/icon/href", "/icon/color",
       "/type", "/category", "/room", "/is_favorite", "/is_visible", "/is_protected", "/order",
       "/state/value", "/state/format", "/state/color" ];
    let cat_room_sub_topics = [ "/name", "/icon/name", "/icon/href", "/icon/color", "/image",
      "/is_visible", "/is_protected", "/order" ];

    this.registerSubTopics(this.controls, this.controlsSubject, 'control', control_sub_topics);
    this.registerSubTopics(this.categories, this.categoriesSubject, 'category', cat_room_sub_topics);
    this.registerSubTopics(this.rooms, this.roomsSubject, 'room', cat_room_sub_topics);
  }

  
  private registerSubTopics(data: any, subject: any, domain_topic: string, sub_topics: string[]) {
    sub_topics.forEach( element => { 
      let full_topic_name = this.registered_topic_prefix+'/'+domain_topic+'/+'+element; // note: whildcard included
      if (this.registered_topics.includes(full_topic_name)) {
        console.log("topic already exists and ignored:",full_topic_name );
        return;
      }
      this.registered_topics.push(full_topic_name);
      this.subscription.push( this.mqttService.observe(full_topic_name)
      .subscribe((message: IMqttMessage) => {
        let topic_received = message.topic.replace(this.registered_topic_prefix+'/'+domain_topic+'/', '').split('/');
        let idx = this.findTopic(data, domain_topic+'/'+topic_received[0]);
        let msg = message.payload.toString();

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
    let idx = this.findTopic(this.controls, obj.topic);
    let topic_root = this.registered_topic_prefix+'/'+obj.topic;

    if (idx==-1) {
      console.log('Topic '+obj.topic+' not found. Nothing published.');
      return;
    }
    
    this.mqttService.unsafePublish(topic_root+'/state/value', obj.state.value, { qos: 1, retain: false });
    console.log('MQTT publish:', topic_root+'/state/value', obj.state.value);
  }

}