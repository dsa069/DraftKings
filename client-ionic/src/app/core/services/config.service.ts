import { Injectable, signal, Signal } from '@angular/core';

export type BackendType = 'node' | 'springboot';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly BACKEND_KEY = 'selected_backend';

  // 1. Señal privada con el valor inicial del localStorage
  private _selectedBackend = signal<BackendType>(this.getSavedBackend());

  // 2. Vista pública readonly para los componentes
  public selectedBackend: Signal<BackendType> =
    this._selectedBackend.asReadonly();

  private getSavedBackend(): BackendType {
    const type = localStorage.getItem(this.BACKEND_KEY) as BackendType;
    return type || 'node';
  }

  /**
   * Solo guarda y reinicia si el backend elegido es distinto al actual.
   */
  applyBackendChange(newType: BackendType): void {
    if (newType !== this._selectedBackend()) {
      localStorage.setItem(this.BACKEND_KEY, newType);
      console.log(`Backend cambiado a ${newType}, recargando aplicación...`);
      // No actualizamos la señal aquí porque el reload reiniciará todo el estado de la app
      window.location.reload();
    }
  }
}
