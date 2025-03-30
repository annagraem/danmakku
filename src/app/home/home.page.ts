import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Painting } from '../models/painting';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    RouterModule,
  ]
})
export class HomePage {
  private readonly router = inject(Router);

  readonly paintings: Painting[] = [
    {
      id: 'kid-lantern',
      name: 'ランターンの子',
      imageSrc: 'assets/illustrations/painting-mock.jpeg',
      videoSrc: '',
      audioSrc: ''
    }
  ]

  goToPlayer(id: string) {
    this.router.navigate(['player', id]);
  }
}
