
import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PaintingService } from '../services/painting.service';
import { Painting } from '../models/painting';
import { perceptualToAmplitude } from '@discordapp/perceptual';
import { NativeAudio } from '@capacitor-community/native-audio';

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
  
  $painting: WritableSignal<Painting | undefined> = signal(undefined);
  $paintingId = computed<string>(() =>
    this.$painting()?.id ?? ''
  );

  $audioDuration = signal(188);
  $audioCurrentTime = signal(0);
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

  readonly MAX_VOLUME = 1;
  readonly DEFAULT_VOLUME = this.MAX_VOLUME * 0.6;
  $currentVolume = signal(this.DEFAULT_VOLUME);

  private readonly sliderLeftColor = 'rgba(255, 255, 255, 0.5)';
  private readonly sliderRightColor = 'rgba(255, 255, 255, 0.15)';
  $timeSliderBg = computed(() =>
    this.computeGradient(this.$audioCurrentTime(), this.$audioDuration())
  );
  $volumeSliderBg = computed(() =>
    this.computeGradient(this.$currentVolume(), this.MAX_VOLUME)
  );

  constructor() {}

  ngOnInit() {
    this.$painting.set(this.paintingService.getPainting(this.id));

    this.initializeAudio();



  }

  private async initializeAudio() {
    if (this.$painting()) {

      
      await NativeAudio.preload({
        assetId: this.$paintingId(),
        assetPath: 'public/' + this.$painting()?.audioSrc,
        isUrl: false
      });

      this.$audioCurrentTime.set(0);

      await NativeAudio.setVolume({
        assetId: this.$paintingId(),
        volume: perceptualToAmplitude(this.$currentVolume())
      })

      NativeAudio.play({
        assetId: this.$paintingId(),
        time: 0,
      });
    }
  }


  /*
    Audio tag events
  */

  //   <audio #audio autoplay="true" [src]="painting.audioSrc"
  //   (loadedmetadata)="onLoadedMetadata()" (play)="onPlaying()" (pause)="onPausing()" (ended)="onEnded()" (timeupdate)="onTimeUpdate()" >
  // </audio>
  onLoadedMetadata() {
    if (this.audioElement?.nativeElement) {
      // TODO: fix issue with computing audio duration on iOS 16
      //this.$audioDuration.set(this.audioElement.nativeElement.duration);
      this.$audioCurrentTime.set(0);
      this.audioElement.nativeElement.volume = perceptualToAmplitude(this.$currentVolume());
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
  onTimeSliderChangeEnd(event: Event) {
    const value = event.target instanceof HTMLInputElement ? event.target.value : undefined
    if (value) {
      this.$audioCurrentTime.set(+value);
      if (this.$isAudioPlaying()) {
        NativeAudio.play({ assetId: this.$paintingId(), time: this.$audioCurrentTime() });
      }

      // if (this.audioElement?.nativeElement) {
      //   this.audioElement.nativeElement.currentTime = this.$audioCurrentTime();
      // }
    }
  }

  onVolumeSliderChangeEnd(event: Event) {
    const value = event.target instanceof HTMLInputElement ? event.target.value : undefined
    if (value) {
      this.$currentVolume.set(+value);
      NativeAudio.setVolume({
        assetId: this.$paintingId(),
        volume: perceptualToAmplitude(this.$currentVolume()),
      });
      // if (this.audioElement?.nativeElement) {
      //   this.audioElement.nativeElement.volume = perceptualToAmplitude(this.$currentVolume());
      // }
    }
  }

  async togglePlayPause() {
    const isPlaying = (await NativeAudio.isPlaying({ assetId: this.$paintingId() })).isPlaying;

    if (isPlaying) {
      NativeAudio.pause({ assetId: this.$paintingId() });
      this.$isAudioPlaying.set(false);
    } else {
      NativeAudio.play({ assetId: this.$paintingId(), time: this.$audioCurrentTime() });
      this.$isAudioPlaying.set(true);
    }

    // if (this.audioElement?.nativeElement) {
    //   if (this.$isAudioPlaying()) {
    //     this.audioElement.nativeElement.pause();
    //   } else {
    //     this.audioElement.nativeElement.play();
    //   }
    // }
  }

  goBack() {
    NativeAudio.stop({ assetId: this.$paintingId() });
    this.$audioCurrentTime.set(0);
    this.router.navigate(['/'], { replaceUrl: true });
  }

  private computeGradient(currentValue: number, maxValue: number): string {
    const currentPercentage = currentValue / maxValue * 100;
    return `linear-gradient(to right, ${this.sliderLeftColor} 0%, ${this.sliderLeftColor} ${currentPercentage}%, ${this.sliderRightColor} ${currentPercentage}%, ${this.sliderRightColor} 100%)`;
  }
}
