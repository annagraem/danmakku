import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PaintingService } from '../services/painting.service';

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
  readonly paintingService = inject(PaintingService);
  private readonly router = inject(Router);

  goToPlayer(id: string) {
    this.router.navigate(['player', id]);
  }
}
