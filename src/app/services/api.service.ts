import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { Settings } from '../interfaces/settings'
import { RPCResponse } from '../interfaces/rpc.response'

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Init with null to filter out the first value in a guard!
  public isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  public currentAccessToken : string = '';
  private accessToken: string = '';
  private refreshToken: string = '';
  private loxberryUrl: string = '';
  private loxberryIP: string = '';

  constructor(
    private http: HttpClient, 
    private router: Router,
    private storageService: StorageService) {

    this.storageService.getSettings().subscribe( (settings: Settings) => 
    { 
      if (settings)
      { this.accessToken = settings.accessToken;
        this.refreshToken = settings.refreshToken;
        this.loxberryUrl = settings.loxberryUrl;
        this.loxberryIP = settings.loxberryIP;
        this.loadToken();
      }
    });
  }

  // Load accessToken on startup
  loadToken() {
    if (this.accessToken) {
      this.currentAccessToken = this.accessToken;
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }

  // Get protected MQTT settings
  getMqttSettings() {
    if (this.accessToken) {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'x-access-token': this.accessToken
        })
      }
      this.http.get(this.loxberryUrl+'/mqtt_connectiondetails', httpOptions).subscribe(
        (response: RPCResponse) => { 
          console.log("mqtt:", response);
          this.storageService.store(
            { mqttIP: this.loxberryIP,
              mqttUsername: response.result.brokeruser,
              mqttPW: response.result.brokerpass,
              mqttPort: response.result.websocketport,
              mqttTopicPrefix: 'loxberry/app'
            });
       });
    }
  }

  // Sign in a user and store access and refres token
  login(credentials: { ipaddress, username, password }): Observable<any> {
    this.storageService.setLoxBerryIP(credentials.ipaddress);
    return this.http.post(this.loxberryUrl +'/auth/login', credentials).pipe(
      switchMap((tokens: { accessToken, refreshToken }) => {
        this.currentAccessToken = tokens.accessToken;
        const storeAccess = this.storageService.setAccessToken(tokens.accessToken);
        const storeRefresh = this.storageService.setRefreshToken(tokens.refreshToken);
        return from(Promise.all([storeAccess, storeRefresh]));
      }),
      tap(_ => {
        this.isAuthenticated.next(true);
        this.getMqttSettings();
      })
    )
  }

  // Remove all local tokens at the client side
  // and remove refreshToken at server side
  logout() {
    console.log("logout token:", this.refreshToken);
    if (this.refreshToken) // only initiate logout if we have a refreshToken
    {
      this.http.post(this.loxberryUrl+'/auth/logout', { 'refreshToken': this.refreshToken }).subscribe(_ => {
        this.currentAccessToken = null;
        // Remove all stored tokens
        this.storageService.clearAccessToken();
        this.storageService.clearRefreshToken();
        this.isAuthenticated.next(false);
        this.router.navigateByUrl('/', { replaceUrl: true });
      });
    }
  }

  // Load the refresh token from storage
  // then attach it as the header for one specific API call
  getNewAccessToken() {
    if (this.refreshToken) {
      const body = { 'refreshToken': this.refreshToken };
      return this.http.post(this.loxberryUrl+'/auth/refresh', body);
    } else {
      // No stored refresh token
      return of(null);
    }
  }

  // Store a new access token
  storeAccessToken(accessToken) {
    this.currentAccessToken = accessToken;
    return from(this.storageService.setAccessToken(accessToken));
  }
}