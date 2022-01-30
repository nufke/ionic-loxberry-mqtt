import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

  Pages = [
    {
      title: 'Favorites',
      url: '/favorites',
      icon: 'star-sharp'
    },
    {
      title: 'Rooms',
      url: '/rooms',
      icon: 'grid-sharp'
    },
    {
      title: 'Categories',
      url: '/categories',
      icon: 'list-sharp'
    },
    {
      title: 'Login',
      url: '/login',
      icon: 'log-in'
    },
    {
      title: 'About',
      url: '/about',
      icon: 'information-circle-outline'
    }
  ];

  selectedPath = '';
  login = false;

  constructor(
    private router: Router,
    private apiService: ApiService)
  {
    this.router.events.subscribe((event: RouterEvent) => {
      this.selectedPath = event.url;
    });

    this.apiService.isAuthenticated.subscribe((resp: any) => {
      this.login = resp;
      if (resp) {
        this.Pages[3] =  {
          title: 'Logout',
          url: '/login/out',
          icon: 'log-out'
        }
      }
      else
      this.Pages[3] =  {
        title: 'Login',
        url: '/login/in',
        icon: 'log-in'
      }

      console.log('login state', this.login);
      
    });

  }

  ngOnInit() {
  }

}
