
import { Injectable } from '@angular/core';
import { Painting } from '../models/painting';

@Injectable({
  providedIn: 'root'
})
export class PaintingService {

  readonly paintings: Painting[] = [
    {
      id: 'kid-lantern',
      name: 'ランターンの子',
      imageSrc: 'assets/illustrations/painting-mock.jpeg',
      videoSrc: 'assets/painting-mock.mp4',
      audioSrc: 'assets/painting-mock.mp3'
    }
  ];

  getPainting(id: string): Painting | undefined {
    return this.paintings.find((painting) => painting.id === id);
  }

  getAllPaintings(): Painting[] {
    return this.paintings;
  }

}
