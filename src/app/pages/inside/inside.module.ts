import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InsidePageRoutingModule } from './inside-routing.module';
import { InsidePage } from './inside.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InsidePageRoutingModule
  ],
  declarations: [InsidePage]
})
export class InsidePageModule {}
