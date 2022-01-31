import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'favorites',
        loadChildren: () => import('../favorites/favorites.module').then(m => m.FavoritesPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'rooms',
        loadChildren: () => import('../rooms/rooms.module').then(m => m.RoomsPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'categories',
        loadChildren: () => import('../categories/categories.module').then(m => m.CategoriesPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'categories/control/:domain/:id',
        loadChildren: () => import('../controls/controls.module').then(m => m.ControlsPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'rooms/control/:domain/:id',
        loadChildren: () => import('../controls/controls.module').then(m => m.ControlsPageModule),
        canActivate: [AuthGuard]
      } ,
      {
        path: '',
        redirectTo: '/login/in',
        pathMatch: ''
      }
    ]
  } /*,
  {
    path: '',
    redirectTo: '/favorites',
    pathMatch: 'full'
  }*/
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
