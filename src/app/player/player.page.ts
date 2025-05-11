
import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, Platform } from '@ionic/angular';
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
  private readonly platform = inject(Platform);

  @ViewChild('audio') audioElement?: ElementRef;

  id: string = this.activatedRoute.snapshot.paramMap.get('id') as string;

  $painting: WritableSignal<Painting | undefined> = signal(undefined);
  $paintingId = computed<string>(() =>
    this.$painting()?.id ?? ''
  );

  $audioDuration = computed(() => this.$painting()?.audioDuration ?? 0);
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

  private nativeAudioListener?: any;

  constructor() {}

  ngOnInit() {
    this.$painting.set(this.paintingService.getPainting(this.id));
  }

  ionViewWillEnter() {
    this.setupAudio();
  }

  ionViewDidLeave() {
    this.clearAudio();
  }

  private async setupAudio() {
    if (this.$painting()) {
      let assetPath = this.$painting()?.audioSrc ?? '';
      if (this.platform.is('ios')) {
        assetPath = 'public/' + assetPath;
      }

      await NativeAudio.preload({
        assetId: this.$paintingId(),
        assetPath,
        isUrl: false
      });

      await NativeAudio.setVolume({
        assetId: this.$paintingId(),
        volume: perceptualToAmplitude(this.$currentVolume())
      })

      this.$audioCurrentTime.set(0);
      NativeAudio.play({ assetId: this.$paintingId(), time: 0 });
      this.$isAudioPlaying.set(true);

      this.nativeAudioListener = setInterval(async () => {
        const currentTime = (await NativeAudio.getCurrentTime({ assetId: this.$paintingId() })).currentTime;
        const isPlaying = (await NativeAudio.isPlaying({ assetId: this.$paintingId() })).isPlaying;

        console.log('setInterval', currentTime, isPlaying, this.$audioDuration())
        if (isPlaying) {
          this.$audioCurrentTime.set(currentTime);
        } else {
          this.$isAudioPlaying.set(false);

          if (currentTime >= this.$audioDuration() - 0.5) {
            NativeAudio.stop({ assetId: this.$paintingId() });
            this.$audioCurrentTime.set(0);
          }
        }
      }, 250);
    }
  }

  private clearAudio() {
    NativeAudio.unload({ assetId: this.$paintingId() });
    this.$audioCurrentTime.set(0);
    if (this.nativeAudioListener) {
      clearInterval(this.nativeAudioListener);
    }
  }

  /*
    User events
  */
  onTimeSliderChangeEnd(event: Event) {
    const value = event.target instanceof HTMLInputElement ? event.target.value : undefined
    if (value) {
      this.$audioCurrentTime.set(+value);
      console.log('time slider change', this.$audioCurrentTime(), this.$isAudioPlaying());
      if (this.$isAudioPlaying()) {
        NativeAudio.play({ assetId: this.$paintingId(), time: this.$audioCurrentTime() });
      }
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
    }
  }

  async togglePlayPause() {
    const isPlaying = (await NativeAudio.isPlaying({ assetId: this.$paintingId() })).isPlaying;

    console.log('togglePlayPause', isPlaying)

    if (isPlaying) {
      NativeAudio.pause({ assetId: this.$paintingId() });
      this.$isAudioPlaying.set(false);
    } else {
      NativeAudio.play({ assetId: this.$paintingId(), time: this.$audioCurrentTime() });
      this.$isAudioPlaying.set(true);
    }
  }

  goBack() {
    this.router.navigate(['/'], { replaceUrl: true });
  }

  private computeGradient(currentValue: number, maxValue: number): string {
    const currentPercentage = currentValue / maxValue * 100;
    return `linear-gradient(to right, ${this.sliderLeftColor} 0%, ${this.sliderLeftColor} ${currentPercentage}%, ${this.sliderRightColor} ${currentPercentage}%, ${this.sliderRightColor} 100%)`;
  }
}
