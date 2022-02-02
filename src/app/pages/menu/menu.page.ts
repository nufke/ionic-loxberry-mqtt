import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { StorageService } from '../../services/storage.service';

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

  private selectedPath: string = '';
  private login: boolean = false;
  
  public darkTheme: boolean = false; 

  constructor(
    private router: Router,
    private apiService: ApiService,
    private renderer: Renderer2,
    private storageService: StorageService )
  {
    this.router.events.subscribe((event: RouterEvent) => {
      this.selectedPath = event.url;
    });

    this.apiService.isAuthenticated.subscribe((resp: any) => {
      this.login = resp;
      if (resp) {
        this.Pages[3] =  {
          title: 'Logout',
          url: '/login/logout',
          icon: 'log-out'
        }
      }
      else
      this.Pages[3] =  {
        title: 'Login',
        url: '/login/login',
        icon: 'log-in'
      }

      console.log('login state', this.login);
      
    });

    this.storageService.getSettings().subscribe( settings => 
    { 
      if (settings){
        this.darkTheme = settings.darkTheme;
        this.changeTheme(this.darkTheme);
      }
    }); 
  }

  ngOnInit() {
  }
  
  changeTheme(isDark: boolean) {
    if (isDark) {
      this.renderer.setAttribute(document.body, 'color-theme', 'dark');
    } else {
      this.renderer.setAttribute(document.body, 'color-theme', 'light');
    }
  }

  onToggleDarkTheme() {
    console.log('darkTheme: ', this.darkTheme);
    this.changeTheme(this.darkTheme);
    this.storageService.store({darkTheme: this.darkTheme});
  }

}
