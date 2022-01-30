import { Injectable } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  
  constructor(
    private apiService: ApiService, 
    private router: Router
  ) { }
 
  canLoad(): Observable<boolean> {    
    return this.apiService.isAuthenticated.pipe(
      filter(val => val !== null), // Filter out initial Behaviour subject value
      take(1), // Otherwise the Observable doesn't complete!
      map(isAuthenticated => {
        if (isAuthenticated) {
          console.log('user is authenticated');          
          return true;
        } else {
          console.log('user not authenticated, revert to home');          
          this.router.navigateByUrl('/')
          return false;
        }
      })
    );
  }
}
