import { Injectable, computed, inject, signal } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import {
  Storage,
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from '@angular/fire/storage';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private readonly CACHE_KEY = 'cached_player_camera_photo';

  private readonly storage = inject(Storage);
  private _cameraPhotoUri = signal<string | null>(null);
  private _urlInput = signal<string>('');
  private _localImageFile = signal<File | null>(null);
  private _localImagePreviewUrl = signal<string | null>(null);
  private _lastUploadedStoragePath: string | null = null;

  public currentPhotoPreview = computed(() => {
    const localPreviewUrl = this._localImagePreviewUrl();
    const cameraUri = this._cameraPhotoUri();
    const url = this._urlInput().trim();
    return localPreviewUrl || cameraUri || (url !== '' ? url : null);
  });

  public urlInputValue = this._urlInput.asReadonly();

  constructor() {
    void this.loadCachedPreview();
  }

  async takePhoto(): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (image.webPath) {
        await this.updateCameraPhoto(image.webPath);
      }
    } catch (error) {
      console.error('Captura cancelada', error);
    }
  }

  async updateCameraPhoto(uri: string | null): Promise<void> {
    this.clearLocalImagePreview();
    this._cameraPhotoUri.set(uri);
    if (uri) {
      this._urlInput.set('');
      this._localImageFile.set(null);
      await Preferences.set({ key: this.CACHE_KEY, value: uri });
    } else {
      await Preferences.remove({ key: this.CACHE_KEY });
    }
  }

  async updateUrlInput(url: string): Promise<void> {
    this.clearLocalImagePreview();
    this._urlInput.set(url);
    if (url.trim() !== '') {
      this._cameraPhotoUri.set(null);
      this._localImageFile.set(null);
      await Preferences.remove({ key: this.CACHE_KEY });
    }
  }

  async updateLocalImageFile(file: File | null): Promise<void> {
    this._cameraPhotoUri.set(null);
    this._urlInput.set('');
    await Preferences.remove({ key: this.CACHE_KEY });

    this._localImageFile.set(file);
    this.clearLocalImagePreview();

    if (file) {
      this._localImagePreviewUrl.set(URL.createObjectURL(file));
    }
  }

  async clearPreviewCache(): Promise<void> {
    this._cameraPhotoUri.set(null);
    this._urlInput.set('');
    this._localImageFile.set(null);
    this._lastUploadedStoragePath = null;
    this.clearLocalImagePreview();
    await Preferences.remove({ key: this.CACHE_KEY });
  }

  async uploadCurrentImage(playerName: string): Promise<string | null> {
    this._lastUploadedStoragePath = null;

    const imageUriOrUrl = this.currentPhotoPreview();
    const localImageFile = this._localImageFile();

    if (localImageFile) {
      const blob = localImageFile.slice(
        0,
        localImageFile.size,
        localImageFile.type
      );

      const fileExtension =
        localImageFile.type.split('/')[1] ||
        localImageFile.name.split('.').pop() ||
        'jpg';
      this._lastUploadedStoragePath = `players/${Date.now()}_${playerName.replace(
        /\s+/g,
        '_'
      )}.${fileExtension}`;

      const storageReference = ref(this.storage, this._lastUploadedStoragePath);
      await uploadBytes(storageReference, blob);
      return await getDownloadURL(storageReference);
    }

    const isCameraPhoto =
      imageUriOrUrl &&
      (imageUriOrUrl.startsWith('blob:') ||
        imageUriOrUrl.startsWith('http://localhost') ||
        imageUriOrUrl.startsWith('capacitor:'));

    if (isCameraPhoto && imageUriOrUrl) {
      const response = await fetch(imageUriOrUrl);
      const blob = await response.blob();

      const fileExtension = blob.type.split('/')[1] || 'jpg';
      this._lastUploadedStoragePath = `players/${Date.now()}_${playerName.replace(
        /\s+/g,
        '_'
      )}.${fileExtension}`;

      const storageReference = ref(this.storage, this._lastUploadedStoragePath);
      await uploadBytes(storageReference, blob);
      return await getDownloadURL(storageReference);
    }

    return imageUriOrUrl;
  }

  async rollbackLastUpload(): Promise<void> {
    if (!this._lastUploadedStoragePath) {
      return;
    }

    try {
      const storageReference = ref(this.storage, this._lastUploadedStoragePath);
      await deleteObject(storageReference);
    } catch (error) {
      console.error('Error en rollback de imagen:', error);
    } finally {
      this._lastUploadedStoragePath = null;
    }
  }

  private async loadCachedPreview(): Promise<void> {
    const { value } = await Preferences.get({ key: this.CACHE_KEY });
    if (value) {
      this._cameraPhotoUri.set(value);
    }
  }

  private clearLocalImagePreview(): void {
    const previewUrl = this._localImagePreviewUrl();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    this._localImagePreviewUrl.set(null);
  }
}
