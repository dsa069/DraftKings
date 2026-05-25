import {
  Component,
  AfterViewInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locateOutline, pin } from 'ionicons/icons';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-capture',
  standalone: true,
  imports: [CommonModule, IonGrid, IonRow, IonCol, IonText, IonButton, IonIcon],
  templateUrl: './map-capture.component.html',
  styleUrls: ['./map-capture.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapCaptureComponent implements AfterViewInit, OnDestroy {
  // Inputs y Outputs directos y simples
  @Input() initialLocation!: { lat: number; lng: number };
  @Input() isReadOnly: boolean = false;
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();
  @Output() requestCenter = new EventEmitter<void>(); // Para avisar al padre si se pulsa "Usar mi ubicación"

  public currentLocation: { lat: number; lng: number } | null = null;
  private map!: L.Map;
  private marker!: L.Marker;
  private resizeObserver!: ResizeObserver;
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    addIcons({ locateOutline, pin });
  }

  ngAfterViewInit(): void {
    // Usamos el Input directamente
    const { lat, lng } = this.initialLocation;

    this.map = L.map('leaflet-map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.setMarker(lat, lng);
    this.updateCurrentLocation(lat, lng);

    // Solo permitir clicks en el mapa si no está en modo read-only
    if (!this.isReadOnly) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.setMarker(e.latlng.lat, e.latlng.lng);
        this.updateCurrentLocation(e.latlng.lat, e.latlng.lng);
      });
    }

    const mapElement = document.getElementById('leaflet-map');
    if (mapElement) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.map) this.map.invalidateSize();
      });
      this.resizeObserver.observe(mapElement);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.map) this.map.remove();
  }

  private setMarker(lat: number, lng: number): void {
    if (this.marker) this.map.removeLayer(this.marker);

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

  private updateCurrentLocation(lat: number, lng: number) {
    this.currentLocation = { lat, lng };
    this.locationSelected.emit(this.currentLocation);
    this.cdr.markForCheck();
  }

  public centerOnDevice(): void {
    this.requestCenter.emit();
  }

  // Método auxiliar para que el padre pueda re-centrar el mapa si es necesario
  public flyToLocation(lat: number, lng: number) {
    if (this.map) {
      this.map.flyTo([lat, lng], 15);
      this.setMarker(lat, lng);
      this.updateCurrentLocation(lat, lng);
    }
  }
}
