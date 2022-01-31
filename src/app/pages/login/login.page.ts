import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credentials: FormGroup;

  public loxberryUsername: string = '';
  public loxberryIP: string = '';
  public loxberryPW: string = '';

  private action: string;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController,
    private storageService: StorageService,
    private route: ActivatedRoute
  ) 
  {
    this.storageService.getSettings().subscribe( settings => 
    { 
      if (settings){
        this.loxberryUsername = settings.loxberryUsername;
        this.loxberryIP = settings.loxberryIP;
        this.updateFields();
      }
    });      
  }
 
  ngOnInit() {
    this.action = this.route.snapshot.paramMap.get('action');
    if (this.action === 'out') this.logout();

    this.credentials = this.fb.group({
      ipaddress: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      roles: [['owner'], Validators.required]
    });
    
    // get initial values
    this.updateFields();
  }
 
  async updateFields() {
    if(this.credentials) {
      this.credentials.setValue({
          'ipaddress': this.loxberryIP,
          'username': this.loxberryUsername,
          'password': this.loxberryPW,
          'roles': ['owner']
      })
    }
  }

  async login() {
    const loading = await this.loadingController.create({
      cssClass: 'spinner',
      spinner​: 'crescent',
      message: 'Please wait...'
    });

    await loading.present();
    
    this.loxberryPW = this.credentials.value.password;
    await this.storageService.store(
    { 
      loxberryIP: this.credentials.value.ipaddress, 
      loxberryUsername: this.credentials.value.username,
    });

    this.apiService.login(this.credentials.value).subscribe( async _ => {        
        await loading.dismiss();        
        this.router.navigateByUrl('/favorites', { replaceUrl: true });
      },
      async (res) => {        
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Login failed',
          message: res.error.msg,
          buttons: ['OK'],
        });
        await alert.present();
      }
    );
  }

  logout() {
    this.apiService.logout();
  }
}
