import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-inside',
  templateUrl: './inside.page.html',
  styleUrls: ['./inside.page.scss'],
})
export class InsidePage implements OnInit {
  data = null;

  constructor(private apiService: ApiService) { }

  ngOnInit() { }

  async getData() {
    this.data = null;

    this.apiService.checkAccessRights().then((res: any) => {
      if (res) {
        this.data = res.message;
        console.log('data', this.data);
      }
    });
  }

  logout() {
    this.apiService.logout();
  }
}
