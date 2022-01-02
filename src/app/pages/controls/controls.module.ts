import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlsPage } from './controls.page';

import { ControlsPageRoutingModule } from './controls-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: ControlsPage }]),
    ControlsPageRoutingModule,
  ],
  declarations: [
    ControlsPage
  ],
  providers: [
  ],
})
export class ControlsPageModule {}
