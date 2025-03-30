
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, Platform } from '@ionic/angular';

@Component({
  selector: 'makku-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
  ]
})
export class PlayerPage implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  id: string = this.activatedRoute.snapshot.paramMap.get('id') as string;

  constructor() {}

  ngOnInit() {
    //const id =
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
