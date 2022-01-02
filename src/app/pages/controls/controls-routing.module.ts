import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ControlsPage } from './controls.page';

const routes: Routes = [
  { path: '/control/:controlId', //Was '' 
    component: ControlsPage 
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ControlsPageRoutingModule {}
