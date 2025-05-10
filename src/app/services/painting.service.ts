
import { Injectable } from '@angular/core';
import { Painting } from '../models/painting';

@Injectable({
  providedIn: 'root'
})
export class PaintingService {

  readonly paintings: Painting[] = [
    {
      id: 'yomawari',
      name: '夜回',
      imageSrc: 'assets/paintings/yomawari.jpg',
      videoSrc: 'assets/paintings/yomawari.mp4',
      audioSrc: 'assets/paintings/yomawari.mp3',
      audioDuration: 188,
    }
  ];

  getPainting(id: string): Painting | undefined {
    return this.paintings.find((painting) => painting.id === id);
  }

  getAllPaintings(): Painting[] {
    return this.paintings;
  }

}
