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
  // Añadimos una referencia al ResizeObserver
  private resizeObserver!: ResizeObserver;

  constructor() {
    addIcons({ locateOutline, pin });
  }

  async ngAfterViewInit(): Promise<void> {
    await this.initializeMapWithDeviceLocation();
  }

  ngOnDestroy(): void {
    // Limpiamos los listeners para evitar fugas de memoria
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.map) {
      this.map.remove();
    }
  }

  private async initializeMapWithDeviceLocation(): Promise<void> {
    const coords = await this.locationService.requestDeviceCurrentPosition();

    const initialLat = coords ? coords.lat : 40.4168;
    const initialLng = coords ? coords.lng : -3.7038;

    this.map = L.map('leaflet-map').setView([initialLat, initialLng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

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
    // SOLUCIÓN DEFINITIVA PARA REDIMENSIONADO EN IONIC
    // ==========================================
    const mapElement = document.getElementById('leaflet-map');
    if (mapElement) {
      // El observador vigila si el DIV del mapa cambia de dimensiones (ej. animaciones de Ionic)
      this.resizeObserver = new ResizeObserver(() => {
        // En cuanto cambie, obligamos a Leaflet a recalcular todo instantáneamente
        if (this.map) {
          this.map.invalidateSize();
        }
      });
      this.resizeObserver.observe(mapElement);
    }
  }

  private setMarker(lat: number, lng: number): void {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    this.marker = L.marker([lat, lng], { icon }).addTo(this.map);
  }

  public async centerOnDevice(): Promise<void> {
    const coords = await this.locationService.requestDeviceCurrentPosition();

    if (coords) {
      this.map.flyTo([coords.lat, coords.lng], 15);
      this.setMarker(coords.lat, coords.lng);
      this.locationService.updateSelectedLocation(coords.lat, coords.lng);
    }
  }
}
