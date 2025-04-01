
import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, Platform } from '@ionic/angular';
import { PaintingService } from '../services/painting.service';
import { Painting } from '../models/painting';

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
  readonly paintingService = inject(PaintingService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @ViewChild('audio') audioElement?: ElementRef;

  id: string = this.activatedRoute.snapshot.paramMap.get('id') as string;
  painting: Painting | undefined;

  $audioDuration = signal(100);
  $audioCurrentTime = signal(30);
  $audioCurrentTimeFormatted = computed(() => {
    const currentTime = this.$audioCurrentTime();
    if (currentTime >= 0) {
      const roundedTime = Math.round(currentTime);
      const minutes = Math.floor(roundedTime / 60);
      const seconds = roundedTime % 60;
      return ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);
    }
    return '';
  });
  $isAudioPlaying = signal(false);

  constructor() {}

  ngOnInit() {
    this.painting = this.paintingService.getPainting(this.id);
  }

  /*
    Audio tag events
  */
  onLoadedMetadata() {
    if (this.audioElement?.nativeElement) {
      this.$audioDuration.set(this.audioElement.nativeElement.duration);
      this.$audioCurrentTime.set(0);
    }
  }

  onPlaying() {
    this.$isAudioPlaying.set(true);
  }

  onPausing() {
    this.$isAudioPlaying.set(false);
  }

  onEnded() {
    this.$isAudioPlaying.set(false);
    if (this.audioElement?.nativeElement) {
      this.audioElement.nativeElement.currentTime = 0;
    }
  }

  onTimeUpdate() {
    if (this.audioElement?.nativeElement) {
      this.$audioCurrentTime.set(this.audioElement.nativeElement.currentTime);
    }
  }

  /*
    User events
  */
  onSliderChangeEnd(event: Event) {
    const value = event.target instanceof HTMLInputElement ? event.target.value : undefined
    if (value) {
      this.$audioCurrentTime.set(+value);
      if (this.audioElement?.nativeElement) {
        this.audioElement.nativeElement.currentTime = this.$audioCurrentTime();
      }
    }
  }

  togglePlayPause() {
    if (this.audioElement?.nativeElement) {
      console.log(this.$isAudioPlaying());
      if (this.$isAudioPlaying()) {
        this.audioElement.nativeElement.pause();
      } else {
        this.audioElement.nativeElement.play();
      }
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
