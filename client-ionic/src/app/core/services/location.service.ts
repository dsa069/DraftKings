import { Injectable, signal } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

export interface AppLocation {
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  // Signals privados para manejar el estado de forma reactiva
  private readonly _selectedLocation = signal<AppLocation | null>(null);
  private readonly _deviceLocation = signal<AppLocation | null>(null);

  // Vistas públicas de solo lectura
  public readonly selectedLocation = this._selectedLocation.asReadonly();
  public readonly deviceLocation = this._deviceLocation.asReadonly();

  /**
   * Actualiza la variable de negocio con las coordenadas seleccionadas en el mapa
   */
  public updateSelectedLocation(lat: number, lng: number): void {
    this._selectedLocation.set({ lat, lng });
  }

  /**
   * Usa Capacitor de forma nativa para obtener el GPS real del usuario
   */
  public async requestDeviceCurrentPosition(): Promise<AppLocation | null> {
    try {
      // Verificamos permisos nativos
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        await Geolocation.requestPermissions();
      }

      // Obtenemos alta precisión del GPS del móvil/navegador
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
      });

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      this._deviceLocation.set(coords);
      return coords;
    } catch (error) {
      console.error('Error obteniendo la ubicación nativa:', error);
      return null;
    }
  }
}
