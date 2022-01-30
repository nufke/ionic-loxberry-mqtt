import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InsidePage } from './inside.page';

const routes: Routes = [
  {
    path: '',
    component: InsidePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InsidePageRoutingModule {}
