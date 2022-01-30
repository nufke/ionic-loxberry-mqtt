import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { Settings } from '../interfaces/settings'

export const SETTINGS_TOKEN_KEY = 'lxb-settings-token';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  private settings: Settings;
  private settingsSubject: BehaviorSubject<Settings> = new BehaviorSubject<Settings>(null);

  constructor() {
    // initial values
    this.settings = {
      loxberryIP: null,
      loxberryUrl: null,
      loxberryAuthPort: null,
      loxberryUsername: null,
      accessToken: null,
      refreshToken: null,
      mqttIP: null,
      mqttUsername: null,
      mqttPW: null,
      mqttPort: null,
      mqttTopicPrefix: null
    }
    // load settings from Storage
    this.loadSettings();
  }

  async update(obj: Settings) {
    for (const [key, value] of Object.entries(obj)) {
      this.settings[key] = value;
    }
    if (this.settings.loxberryIP)
      await this.updateLoxBerryUrlandIP(this.settings.loxberryIP);
  }

  async loadSettings() {
    const settings = await Storage.get({ key: SETTINGS_TOKEN_KEY });
    if (settings.value)
    {
      await this.update(JSON.parse(settings.value));
      this.settingsSubject.next(this.settings);
    }
  }
  
  async store(obj: Settings) : Promise<any> {
    await this.update(obj);
    console.log("store:", this.settings);
    this.settingsSubject.next(this.settings);
    return Storage.set({ key: SETTINGS_TOKEN_KEY, value: JSON.stringify(this.settings) });
  }

  public getSettings() : Observable<Settings> {
    return this.settingsSubject.asObservable();
  }

  async updateLoxBerryUrlandIP(address: string) {
    let ipaddress = '';
    let url = '';
    let port = '';
    if (address.includes("http://")) {    // check if user added prefix
      url = address;
      ipaddress = address.replace('http://','');     // remove http from IP    
    }
    else {
      url = 'http://' + address;
      ipaddress = address;
    }
    if (address.match(":[0-9]{4,6}")) {   // check if user added port
      port = ipaddress.split(':')[1];
      ipaddress = ipaddress.split(':')[0]; // remove port from IP  
    }
    else {
      url = url + ':3030'; // TODO make configurable
      port = '3030';
    }
    this.settings.loxberryIP = ipaddress;
    this.settings.loxberryUrl = url;
    this.settings.loxberryAuthPort = port;
  }

}
