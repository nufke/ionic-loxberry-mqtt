import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of, from } from 'rxjs';
import { ApiService } from '../services/api.service';
import { catchError, finalize, switchMap, filter, take } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  // Used for queued API calls while refreshing tokens
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  isRefreshingToken = false;

  private loxberryUrl: string = '';

  constructor(
    private apiService: ApiService, 
    private toastCtrl: ToastController,
    private storageService: StorageService
  ) 
  {
    this.storageService.getSettings().subscribe( settings => {
      if(settings)
      {
       this.loxberryUrl = settings.loxberryUrl;
      }
    });
  }

  // Intercept every HTTP call
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Check if we need additional token logic or not
    if (this.isInBlockedList(request.url)) {
      return next.handle(request);
    } else {
      return next.handle(this.addToken(request)).pipe(
        catchError(err => {
          if (err instanceof HttpErrorResponse) {
            switch (err.status) {
              case 400:
                return this.handle400Error(err);
              case 401:
                return this.handle401Error(request, next);
              case 403:
                return this.handle403Error(err);
              default:
                return throwError(err);
            }
          } else {
            return throwError(err);
          }
        })
      );
    }
  }

  // Filter out URLs where you don't want to add the token!
  private isInBlockedList(url: string): Boolean {
    // Example: Filter out our login and logout API call
    if (url == `${this.loxberryUrl}/auth` ||
        url == `${this.loxberryUrl}/auth/logout`) {
       return true;
      } else {
        return false;
      }
  }

  // Add our current access token from the service if present
  private addToken(req: HttpRequest<any>) {
    if (this.apiService.currentAccessToken) {
      return req.clone({
        headers: new HttpHeaders({
          'x-access-token': this.apiService.currentAccessToken
        })
      });
    } else {
      return req;
    }
  }

  // We are not just authorized, we couldn't refresh token
  // or something else along the caching went wrong!
  private async handle400Error(err) {
    // Potentially check the exact error reason for the 400
    // then log out the user automatically
    const toast = await this.toastCtrl.create({
      message: 'Logged out due to authentication mismatch',
      duration: 2000
    });
    toast.present();
    this.apiService.logout();
    return of(null);
  }

  // Indicates our access token is invalid, try to load a new one
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // Check if another call is already using the refresh logic
    if (!this.isRefreshingToken) {

      // Set to null so other requests will wait
      // until we got a new token!
      this.tokenSubject.next(null);
      this.isRefreshingToken = true;
      this.apiService.currentAccessToken = null;

      // First, get a new access token
      return this.apiService.getNewAccessToken().pipe(
        switchMap((token: any) => {
          console.log('getNewAccessToken:', token);
          if (token) {
            // Store the new token
            const accessToken = token.accessToken;
            return this.apiService.storeAccessToken(accessToken).pipe(
              switchMap(_ => {
                // Use the subject so other calls can continue with the new token
                this.tokenSubject.next(accessToken);

                // Perform the initial request again with the new token
                return next.handle(this.addToken(request));
              })
            );
          } else {
            // No new token or other problem occurred
            return of(null);
          }
        }),
        finalize(() => {
          // Unblock the token reload logic when everything is done
          this.isRefreshingToken = false;
        })
      );
    } else {
      // "Queue" other calls while we load a new token
      return this.tokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          // Perform the request again now that we got a new token!
          return next.handle(this.addToken(request));
        })
      );
    }
  }

  // Forbidden (403) message when refresh token expired
  private async handle403Error(err) {
    console.log(err.error.message);
    const toast = await this.toastCtrl.create({
      message: err.error.message,
      duration: 2000
    });
    toast.present();
    this.apiService.logout();
    return of(null);
  }

}


