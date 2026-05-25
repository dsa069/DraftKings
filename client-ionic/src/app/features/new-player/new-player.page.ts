import { Component, OnInit, inject, ViewChild } from '@angular/core';
import {
  AppLocation,
  LocationService,
} from '../../core/services/abstract/location.service';
import { Player } from '../../core/models/player.model';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonText,
  IonIcon,
  IonButton,
  IonFooter,
  IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, camera, location, saveOutline } from 'ionicons/icons';
import { NavController } from '@ionic/angular';
import { HeaderSubmenuComponent } from '../../shared/components/header-submenu/header-submenu.component';
import { ImageCaptureComponent } from '../../shared/components/image-capture/image-capture.component';
import { PhotoService } from '../../core/services/abstract/photo.service';
import { PlayerService } from '../../core/services/abstract/player.service';
import { MapCaptureComponent } from '../../shared/components/map-capture/map-capture.component';

@Component({
  selector: 'app-new-player',
  templateUrl: './new-player.page.html',
  styleUrls: ['./new-player.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonText,
    IonIcon,
    IonButton,
    IonFooter,
    IonNote,
    HeaderSubmenuComponent,
    FormsModule,
    ReactiveFormsModule,
    ImageCaptureComponent,
    MapCaptureComponent,
  ],
})
export class NewPlayerPage implements OnInit {
  private readonly fallbackLocation: AppLocation = {
    lat: 40.4168,
    lng: -3.7038,
  };

  private readonly navCtrl = inject(NavController);
  private readonly fb = inject(FormBuilder);
  private readonly playerService = inject(PlayerService);
  private readonly photoService = inject(PhotoService);
  private readonly locationService = inject(LocationService);

  public selectedImageStr: string | null = null;

  public playerForm!: FormGroup;

  // Nuevas variables para gestionar la ubicación
  public initialLocation: AppLocation = this.fallbackLocation;
  public selectedLocation: AppLocation = this.fallbackLocation;

  @ViewChild(MapCaptureComponent) mapComponent!: MapCaptureComponent;

  constructor() {
    addIcons({ person, camera, location, saveOutline });
    this.initForm();
  }

  async ngOnInit() {
    console.log('NewPlayerPage inicializado');
    // Solicitamos la posición inicial real del dispositivo antes de mostrar el mapa.
    const coords = await this.locationService.requestDeviceCurrentPosition();
    this.initialLocation = coords ?? this.fallbackLocation;
    this.selectedLocation = this.initialLocation;
  }

  // Recibe la coordenada que el mapa emite al hacer click
  onLocationSelected(coords: AppLocation) {
    this.selectedLocation = coords;
  }

  // Maneja el botón "Usar mi ubicación"
  async onCenterRequested() {
    const coords = await this.locationService.requestDeviceCurrentPosition();
    if (coords && this.mapComponent) {
      this.initialLocation = coords;
      this.selectedLocation = coords;
      this.mapComponent.flyToLocation(coords.lat, coords.lng);
    }
  }
  private initForm() {
    this.playerForm = this.fb.group({
      displayName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
        ],
      ],
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
        ],
      ],
      age: ['', [Validators.required, Validators.min(15), Validators.max(50)]],
      birthdate: ['', [Validators.required]],
      nationality: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
        ],
      ],
      height: [
        '',
        [Validators.required, Validators.min(140), Validators.max(230)],
      ],
      weight: [
        '',
        [Validators.required, Validators.min(40), Validators.max(130)],
      ],
      team: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
        ],
      ],
      league: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
        ],
      ],
      position: ['', [Validators.required]],
      number: [
        '',
        [Validators.required, Validators.min(1), Validators.max(99)],
      ],
    });
  }

  async onSavePlayer() {
    if (this.playerForm.valid) {
      console.log('Datos válidos listos para guardar:', this.playerForm.value);
      try {
        // LLamada al flujo común centralizado
        // Construimos el objeto Player esperado por el servicio
        const form = this.playerForm.value;
        const player: Player = {
          name: form.displayName,
          firstName: form.firstName,
          lastName: form.lastName,
          age: form.age,
          birthdate: form.birthdate,
          nationality: form.nationality,
          height: form.height,
          weight: form.weight,
          team: form.team,
          league: form.league,
          position: form.position,
          number: form.number,
          latitude: this.selectedLocation.lat,
          longitude: this.selectedLocation.lng,
        };

        const photoUrl = await this.photoService.uploadCurrentImage(
          player.name
        );

        const playerWithPhoto: Player = {
          ...player,
          photoUrl: photoUrl || undefined,
        };

        const createdPlayer = await this.playerService.createPlayer(
          playerWithPhoto
        );

        // Si sale bien, limpiamos la caché del servicio/dispositivo
        await this.photoService.clearPreviewCache();

        // Navegar a la vista de detalle del jugador recién creado con su ID
        if (createdPlayer?.id) {
          this.navCtrl.navigateForward(`/player-detail/${createdPlayer.id}`);
        } else {
          this.navCtrl.navigateBack('/players');
        }
        // this.showToast('¡Jugador guardado de forma segura!');
      } catch (err) {
        //this.showToast('Error al almacenar los datos en el servidor.');
        await this.photoService.rollbackLastUpload();
      }
    } else {
      // Si el usuario fuerza el click, marcamos todo como "tocado" para iluminar los errores
      this.playerForm.markAllAsTouched();
    }
  }
}
