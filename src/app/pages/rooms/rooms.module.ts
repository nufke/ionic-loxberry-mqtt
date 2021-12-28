import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomsPage } from './rooms.page';

import { RoomsPageRoutingModule } from './rooms-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RoomsPageRoutingModule
  ],
  declarations: [
    RoomsPage
  ],
  providers: [
  ],
})
export class RoomsPageModule {}
