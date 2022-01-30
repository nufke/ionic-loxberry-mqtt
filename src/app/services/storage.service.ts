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
    this.loadSettings();
  }

  async loadSettings() {
    const settings = await Storage.get({ key: SETTINGS_TOKEN_KEY });
    if (settings.value)
    {
      this.settings = await JSON.parse(settings.value);
      this.settingsSubject.next(this.settings);
    }
  }

  store(obj: Settings) : Promise<any> {
    for (const [key, value] of Object.entries(obj)) {
      this.settings[key] = value;
    }
    return Storage.set({ key: SETTINGS_TOKEN_KEY, value: JSON.stringify(this.settings) });
  }

  public getSettings() : Observable<Settings> {
    return this.settingsSubject.asObservable();
  }

  setAccessToken(token: string) : Promise<void> {
    this.settings.accessToken = token;
    this.settingsSubject.next(this.settings);
    return Storage.set({ key: SETTINGS_TOKEN_KEY, value: JSON.stringify(this.settings) });
  }

  clearAccessToken() : Promise<any> {
    this.settings.accessToken = '';
    this.settingsSubject.next(this.settings);
    return Storage.set({ key: SETTINGS_TOKEN_KEY, value: JSON.stringify(this.settings) });
  }

  setRefreshToken(token: string) : Promise<void> {
    this.settings.refreshToken = token;
    this.settingsSubject.next(this.settings);
    return Storage.set({ key: SETTINGS_TOKEN_KEY, value: JSON.stringify(this.settings) });
  }

  clearRefreshToken() : Promise<any> {
    this.settings.refreshToken = '';
    this.settingsSubject.next(this.settings);
    return Storage.set({ key: SETTINGS_TOKEN_KEY, value: JSON.stringify(this.settings) }); 
  }
  
  setLoxBerryIP(address: string) : Promise<any> {
    let url = address;
    if (!url.includes("http://")) url = 'http://' + address;
    if (!url.match(":[0-9]{4,6}")) url = url + ':3030';
    this.settings.loxberryIP = address;
    this.settings.loxberryUrl = url;
    this.settingsSubject.next(this.settings);
    return Storage.set({ key: SETTINGS_TOKEN_KEY, value: JSON.stringify(this.settings) });
  }

  setLoxBerryUserName(name: string) : Promise<any> {
    this.settings.loxberryUsername = name;
    this.settingsSubject.next(this.settings);
    return Storage.set({ key: SETTINGS_TOKEN_KEY, value: JSON.stringify(this.settings) });
  }

  setMqttIP(address: string) : Promise<any> {
    this.settings.mqttIP = address;
    this.settingsSubject.next(this.settings);
    return Storage.set({ key: SETTINGS_TOKEN_KEY, value: JSON.stringify(this.settings) });
  }

}
