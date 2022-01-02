import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(
    private navCtrl: NavController ) 
  {}

  click(tab: string) {
    // TODO check other mechanism to navigate to tab root page
    this.navCtrl.navigateRoot(tab);
    //this.tabService.changeTabInContainerPage(this.appTabs.getSelected());       
  }
  
}
