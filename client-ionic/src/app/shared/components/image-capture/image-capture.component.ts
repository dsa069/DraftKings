import { Component, inject, ViewChild } from '@angular/core';
import {
  IonButton,
  IonIcon,
  IonImg,
  IonInput,
  IonGrid,
  IonRow,
  IonLabel,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, imageOutline } from 'ionicons/icons';
import { PhotoService } from '../../../core/services/abstract/photo.service';

@Component({
  selector: 'app-image-capture',
  standalone: true,
  imports: [
    IonButton,
    IonIcon,
    IonImg,
    IonInput,
    IonGrid,
    IonRow,
    IonLabel,
    IonText,
  ],
  templateUrl: './image-capture.component.html',
  styleUrls: ['./image-capture.component.scss'],
})
export class ImageCaptureComponent {
  public photoService = inject(PhotoService);

  // Mantenemos este estado local ya que el fallo de renderizado de la etiqueta HTML es una preocupación puramente visual
  public errorState: boolean = false;

  // Accedemos al componente ion-input para obtener su elemento HTML nativo más tarde
  @ViewChild('fileInput', { static: false }) fileInput!: IonInput;

  constructor() {
    addIcons({ camera, imageOutline });
  }

  async takePhoto(): Promise<void> {
    this.errorState = false;
    await this.photoService.takePhoto();
  }

  onUrlInput(event: any): void {
    const value = event.detail.value || '';
    this.errorState = false;
    this.photoService.updateUrlInput(value);
  }

  // Método puente: extrae el elemento nativo del ion-input y dispara su clic
  async openFileInput(): Promise<void> {
    const nativeInput = await this.fileInput.getInputElement();
    nativeInput.click();
  }

  async onLocalImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.errorState = false;
    await this.photoService.updateLocalImageFile(file);

    // Permite volver a elegir el mismo archivo si el usuario lo necesita.
    if (input) {
      input.value = '';
    }
  }

  onImageError(): void {
    this.errorState = true;
  }

  onImageLoad(): void {
    this.errorState = false;
  }
}
