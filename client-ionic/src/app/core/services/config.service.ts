// src/app/core/services/config.service.ts
import { Injectable } from '@angular/core';

export type BackendType = 'NODE' | 'SPRING'; //| 'FIREBASE' | 'MOCK'; // Preparado para el futuro

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly BACKEND_KEY = 'selected_backend';

  getBackendType(): BackendType {
    const type = localStorage.getItem(this.BACKEND_KEY) as BackendType;
    return type || 'NODE'; // 'NODE' como valor por defecto
  }

  setBackendType(type: BackendType): void {
    localStorage.setItem(this.BACKEND_KEY, type);
  }
}
