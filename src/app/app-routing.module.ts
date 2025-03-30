import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { PlayerPage } from './player/player.page';

const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => HomePage
  },
  {
    path: 'player/:id',
    loadComponent: () => PlayerPage
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
