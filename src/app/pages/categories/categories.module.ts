import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriesPage } from './categories.page';

import { CategoriesPageRoutingModule } from './categories-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: CategoriesPage }]),
    CategoriesPageRoutingModule,
  ],
  declarations: [
    CategoriesPage
  ],
  providers: [
  ],
})
export class CategoriesPageModule {}
