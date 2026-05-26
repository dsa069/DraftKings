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
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonButton,
  IonIcon,
  IonInput,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locateOutline, pin } from 'ionicons/icons';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-capture',
  standalone: true,
  imports: [
    CommonModule,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonButton,
    IonIcon,
    IonInput,
  ],
  templateUrl: './map-capture.component.html',
  styleUrls: ['./map-capture.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapCaptureComponent
  implements AfterViewInit, OnDestroy, OnChanges
{
  // Inputs y Outputs directos y simples
  @Input() initialLocation!: { lat: number; lng: number };
  @Input() isReadOnly: boolean = false;
  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();
  @Output() requestCenter = new EventEmitter<void>(); // Para avisar al padre si se pulsa "Usar mi ubicación"

  public currentLocation: { lat: number; lng: number } | null = null;
  public manualLatitude: number | null = null;
  public manualLongitude: number | null = null;
  public latitudeError: string | null = null;
  public longitudeError: string | null = null;
  private map!: L.Map;
  private marker!: L.Marker;
  private resizeObserver!: ResizeObserver;
  private readonly cdr = inject(ChangeDetectorRef);
  private mapInitialized: boolean = false;

  constructor() {
    addIcons({ locateOutline, pin });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si initialLocation cambió y el mapa ya está inicializado, actualizar la vista del mapa
    console.log('[MapCaptureComponent] ngOnChanges detectado:', changes);
    if (
      changes['initialLocation'] &&
      !changes['initialLocation'].firstChange &&
      this.map &&
      this.mapInitialized
    ) {
      console.log(
        '[MapCaptureComponent] initialLocation cambió, actualizando mapa...'
      );
      const { lat, lng } = this.initialLocation;
      console.log(
        `[MapCaptureComponent] Nueva ubicación: lat=${lat}, lng=${lng}`
      );
      this.map.setView([lat, lng], 15);
      this.setMarker(lat, lng);
      this.updateCurrentLocation(lat, lng);
      this.manualLatitude = lat;
      this.manualLongitude = lng;
      this.clearErrors();
      this.cdr.markForCheck();
    }
  }

  ngAfterViewInit(): void {
    console.log(
      '[MapCaptureComponent] ngAfterViewInit - Inicializando mapa...'
    );
    console.log(
      '[MapCaptureComponent] initialLocation en ngAfterViewInit:',
      this.initialLocation
    );

    const mapElement = document.getElementById('leaflet-map');

    // Destruir cualquier mapa anterior que pueda existir
    if (this.map) {
      console.log('[MapCaptureComponent] Destruyendo mapa anterior...');
      this.map.remove();
      this.map = null as any;
    }

    // Limpiar todas las referencias de Leaflet en el elemento del DOM
    if (mapElement) {
      (mapElement as any)._leaflet_id = null;
      mapElement.innerHTML = '';
    }

    // Crear nuevo mapa con ubicación por defecto o la pre-establecida
    const lat = this.initialLocation?.lat || 0;
    const lng = this.initialLocation?.lng || 0;

    console.log(
      `[MapCaptureComponent] Creando mapa con lat=${lat}, lng=${lng}`
    );
    this.map = L.map('leaflet-map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // Si tenemos ubicación válida, establecer el marcador
    if (this.initialLocation?.lat && this.initialLocation?.lng) {
      this.setMarker(lat, lng);
      this.updateCurrentLocation(lat, lng);
      this.manualLatitude = lat;
      this.manualLongitude = lng;
    }

    // Solo permitir clicks en el mapa si no está en modo read-only
    if (!this.isReadOnly) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.setMarker(e.latlng.lat, e.latlng.lng);
        this.updateCurrentLocation(e.latlng.lat, e.latlng.lng);
        // Update manual inputs when user clicks map
        this.manualLatitude = e.latlng.lat;
        this.manualLongitude = e.latlng.lng;
        this.clearErrors();
        this.cdr.markForCheck();
      });
    }

    if (mapElement) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.map) this.map.invalidateSize();
      });
      this.resizeObserver.observe(mapElement);
    }

    // Marcar que el mapa ha sido inicializado
    this.mapInitialized = true;
    console.log('[MapCaptureComponent] Mapa inicializado correctamente');
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.map) {
      this.map.remove();
      this.map = null as any;
    }
    // Limpiar el elemento del DOM por si acaso
    const mapContainer = document.getElementById('leaflet-map');
    if (mapContainer) {
      (mapContainer as any)._leaflet_id = null;
    }
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

  // Validar que las coordenadas estén dentro de los rangos geográficos válidos
  private validateCoordinate(lat?: number, lng?: number): boolean {
    let isValid = true;

    // Validate latitude
    if (lat === null || lat === undefined || isNaN(lat)) {
      this.latitudeError = 'Latitude is required';
      isValid = false;
    } else if (lat < -90 || lat > 90) {
      this.latitudeError = 'Latitude must be between -90 and 90';
      isValid = false;
    } else {
      this.latitudeError = null;
    }

    // Validate longitude
    if (lng === null || lng === undefined || isNaN(lng)) {
      this.longitudeError = 'Longitude is required';
      isValid = false;
    } else if (lng < -180 || lng > 180) {
      this.longitudeError = 'Longitude must be between -180 and 180';
      isValid = false;
    } else {
      this.longitudeError = null;
    }

    return isValid;
  }

  private clearErrors(): void {
    this.latitudeError = null;
    this.longitudeError = null;
  }

  // Handle manual latitude input change
  public onLatitudeChange(event: any): void {
    const value = event.detail.value;
    const parsedValue =
      value !== null && value !== '' ? parseFloat(value) : null;

    if (parsedValue !== null && !isNaN(parsedValue)) {
      this.manualLatitude = parsedValue;
      this.syncMapToInputs();
    } else if (value === null || value === '') {
      this.manualLatitude = null;
      this.clearErrors();
    } else {
      this.latitudeError = 'Invalid latitude value';
    }

    this.cdr.markForCheck();
  }

  // Handle manual longitude input change
  public onLongitudeChange(event: any): void {
    const value = event.detail.value;
    const parsedValue =
      value !== null && value !== '' ? parseFloat(value) : null;

    if (parsedValue !== null && !isNaN(parsedValue)) {
      this.manualLongitude = parsedValue;
      this.syncMapToInputs();
    } else if (value === null || value === '') {
      this.manualLongitude = null;
      this.clearErrors();
    } else {
      this.longitudeError = 'Invalid longitude value';
    }

    this.cdr.markForCheck();
  }

  // Sync manual inputs to map
  private syncMapToInputs(): void {
    if (
      this.manualLatitude !== null &&
      this.manualLongitude !== null &&
      this.validateCoordinate(this.manualLatitude, this.manualLongitude)
    ) {
      this.setMarker(this.manualLatitude, this.manualLongitude);
      if (this.map) {
        this.map.flyTo([this.manualLatitude, this.manualLongitude], 15);
      }
      this.updateCurrentLocation(this.manualLatitude, this.manualLongitude);
    }
  }

  // Método auxiliar para que el padre pueda re-centrar el mapa si es necesario
  public flyToLocation(lat: number, lng: number) {
    if (this.map) {
      this.map.flyTo([lat, lng], 15);
      this.setMarker(lat, lng);
      this.updateCurrentLocation(lat, lng);
      this.manualLatitude = lat;
      this.manualLongitude = lng;
      this.clearErrors();
      this.cdr.markForCheck();
    }
  }
}
