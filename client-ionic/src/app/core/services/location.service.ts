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
  // Signals para manejar el estado de forma reactiva en toda la app
  public selectedLocation = signal<AppLocation | null>(null);
  public deviceLocation = signal<AppLocation | null>(null);

  /**
   * Actualiza la variable de negocio con las coordenadas seleccionadas en el mapa
   */
  public updateSelectedLocation(lat: number, lng: number): void {
    this.selectedLocation.set({ lat, lng });
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

      this.deviceLocation.set(coords);
      return coords;
    } catch (error) {
      console.error('Error obteniendo la ubicación nativa:', error);
      return null;
    }
  }
}
