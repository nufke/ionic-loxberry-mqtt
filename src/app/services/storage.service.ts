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

}
