import { Component } from '@angular/core';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { Subscription } from 'rxjs';

// TODO move to interface object
interface topic {
  name: string;
  message: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  private subscription: Subscription;
  public topics: topic[];

  constructor(private _mqttService: MqttService) {
    this.topics = [ 
      {name: 'test', message: 'waiting for value...'}, 
      {name: 'test1', message: 'waiting for value...'} 
    ]; 
    
    console.log('subscribe to topics');

    this.topics.forEach( (topic) => 
      this.subscription = this._mqttService.observe(topic.name).subscribe((message: IMqttMessage) => {
        topic.message = message.payload.toString();
        console.log(topic.name,':', topic.message);
      })
    );
  }

  public unsafePublish(topic: string, message: string): void {
    this._mqttService.unsafePublish(topic, message, {qos: 1, retain: true});
  }

  public onClick(){
    console.log(this._mqttService);
  }
  
  public ngOnDestroy() {
    console.log('unsubscribe to topics');
    this.subscription.unsubscribe();
  }
}