import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'favorites',
        loadChildren: () => import('../favorites/favorites.module').then(m => m.FavoritesPageModule)
      },
      {
        path: 'rooms',
        loadChildren: () => import('../rooms/rooms.module').then(m => m.RoomsPageModule)
      },
      {
        path: 'categories',
        loadChildren: () => import('../categories/categories.module').then(m => m.CategoriesPageModule)
      },
      {
        path: 'categories/control/:domain/:id',
        loadChildren: () => import('../controls/controls.module').then(m => m.ControlsPageModule)
      },
      {
        path: 'rooms/control/:domain/:id',
        loadChildren: () => import('../controls/controls.module').then(m => m.ControlsPageModule)
      },
      {
        path: '',
        redirectTo: '/favorites',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/favorites',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
