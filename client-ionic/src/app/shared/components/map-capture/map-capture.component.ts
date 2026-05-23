import { Component, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonGrid,
  IonRow,
  IonText,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locateOutline, pin } from 'ionicons/icons';

// Importación de Leaflet
import * as L from 'leaflet';

// Importamos el servicio de negocio (que usa Capacitor)
import { LocationService } from '../../../core/services/abstract/location.service';

@Component({
  selector: 'app-map-capture',
  standalone: true,
  imports: [CommonModule, IonGrid, IonRow, IonText, IonButton, IonIcon],
  templateUrl: './map-capture.component.html',
  styleUrls: ['./map-capture.component.scss'],
})
export class MapCaptureComponent implements AfterViewInit, OnDestroy {
  public locationService = inject(LocationService);

  private map!: L.Map;
  private marker!: L.Marker;

  constructor() {
    addIcons({ locateOutline, pin });
  }

  // Ahora el inicio es asíncrono para esperar al GPS antes de dibujar el mapa
  async ngAfterViewInit(): Promise<void> {
    await this.initializeMapWithDeviceLocation();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove(); // Limpiamos la memoria
    }
  }

  private async initializeMapWithDeviceLocation(): Promise<void> {
    // 1. Solicitamos la ubicación nativa por Capacitor
    const coords = await this.locationService.requestDeviceCurrentPosition();

    // 2. Definimos el punto de inicio (GPS real o Madrid por defecto)
    const initialLat = coords ? coords.lat : 40.4168;
    const initialLng = coords ? coords.lng : -3.7038;

    // 3. Inicializamos el mapa
    this.map = L.map('leaflet-map').setView([initialLat, initialLng], 15);

    // Añadimos las baldosas
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // 4. LÓGICA DE NEGOCIO: Colocamos el pin
    if (coords) {
      this.setMarker(initialLat, initialLng);
      this.locationService.updateSelectedLocation(initialLat, initialLng);
    }

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.setMarker(lat, lng);
      this.locationService.updateSelectedLocation(lat, lng);
    });

    // ==========================================
    // 5. SOLUCIÓN AL RENDERIZADO (El mapa a trozos)
    // ==========================================
    // Le damos a Ionic 250ms para que termine de acomodar el DOM
    // y luego forzamos a Leaflet a re-dibujarse entero.
    setTimeout(() => {
      this.map.invalidateSize();
    }, 250);
  }

  private setMarker(lat: number, lng: number): void {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    this.marker = L.marker([lat, lng], { icon }).addTo(this.map);
  }

  /**
   * Método para el botón de "Usar mi ubicación" (por si el usuario movió el mapa y quiere volver a centrarlo)
   */
  public async centerOnDevice(): Promise<void> {
    const coords = await this.locationService.requestDeviceCurrentPosition();

    if (coords) {
      this.map.flyTo([coords.lat, coords.lng], 15);
      this.setMarker(coords.lat, coords.lng);
      this.locationService.updateSelectedLocation(coords.lat, coords.lng);
    }
  }
}
