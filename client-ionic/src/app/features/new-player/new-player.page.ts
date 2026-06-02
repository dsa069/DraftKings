import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AppLocation,
  LocationService,
} from '../../core/services/location.service';
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
import { PhotoService } from '../../core/services/photo.service';
import { PlayerService } from '../../core/services/abstract/player.service';
import { AuthService } from '../../core/services/abstract/auth.service';
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
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  public selectedImageStr: string | null = null;

  public playerForm!: FormGroup;

  // Nuevas variables para gestionar la ubicación
  public initialLocation: AppLocation = this.fallbackLocation;
  public selectedLocation: AppLocation = this.fallbackLocation;

  // Variables para modo edición
  public editingPlayerId: string | number | null = null;
  public isEditMode: boolean = false;

  public readonly isAuthenticated = this.authService.isAuthenticated;

  @ViewChild(MapCaptureComponent) mapComponent!: MapCaptureComponent;

  constructor() {
    addIcons({ person, camera, location, saveOutline });
    this.initForm();
  }

  async ngOnInit() {
    console.log('NewPlayerPage inicializado');

    // Detectar si estamos en modo edición
    const playerId = this.route.snapshot.queryParamMap.get('id');
    if (playerId) {
      // El ID puede ser un string (ObjectId MongoDB) o un número
      this.editingPlayerId = isNaN(Number(playerId))
        ? playerId
        : Number(playerId);
      this.isEditMode = true;
      console.log(
        `[ngOnInit] Modo edición detectado. ID: ${this.editingPlayerId}`
      );

      // IMPORTANTE: Limpiar el PhotoService antes de cargar datos del jugador anterior
      // Esto previene residuos de fotos de jugadores previos
      await this.photoService.clearPreviewCache();

      // Esperar a que la autenticación esté disponible antes de cargar datos del jugador
      // Esto evita el error 400 cuando el token aún no está disponible
      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts) {
        const token = await this.authService.getToken();
        console.log(
          `[Intento ${attempts + 1}] Token obtenido:`,
          token ? `${token.substring(0, 20)}...` : 'null'
        );

        if (token) {
          console.log('✅ Token disponible, cargando datos del jugador...');
          await this.loadPlayerData(this.editingPlayerId!);
          break;
        }
        console.log(
          `⏳ Esperando autenticación... intento ${attempts + 1}/${maxAttempts}`
        );
        attempts++;
        // Esperar 200ms antes de reintentar
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (attempts === maxAttempts) {
        console.error(
          '❌ No se pudo obtener token de autenticación después de 10 intentos. Usuario puede no estar autenticado.'
        );
      }
    } else {
      // Nuevo jugador: limpiar el PhotoService también
      await this.photoService.clearPreviewCache();
    }

    // Solo obtener posición del dispositivo para jugadores NUEVOS, no en modo edición
    if (!this.isEditMode) {
      const coords = await this.locationService.requestDeviceCurrentPosition();
      this.initialLocation = coords ?? this.fallbackLocation;
      this.selectedLocation = this.initialLocation;
    }
  }

  private async loadPlayerData(playerId: string | number) {
    try {
      console.log(
        `[loadPlayerData] Iniciando carga del jugador ID: ${playerId}`
      );
      const player = await this.playerService.getPlayerById(playerId);
      console.log('[loadPlayerData] ✅ Jugador cargado exitosamente:', player);

      // Pre-rellenar el formulario con los datos del jugador
      this.playerForm.patchValue({
        displayName: player.name,
        firstName: player.firstName,
        lastName: player.lastName,
        age: player.age,
        birthdate: player.birthdate,
        nationality: player.nationality,
        height: player.height,
        weight: player.weight,
        team: player.team,
        league: player.league,
        position: player.position,
        number: player.number,
      });
      console.log('[loadPlayerData] Formulario pre-rellenado con éxito');

      // Pre-establecer ubicación
      if (player.latitude && player.longitude) {
        this.selectedLocation = {
          lat: player.latitude,
          lng: player.longitude,
        };
        this.initialLocation = this.selectedLocation;
        console.log(
          '[loadPlayerData] Ubicación pre-establecida:',
          this.selectedLocation
        );
      }
      // Pre-establecer foto si existe
      if (player.photoUrl) {
        this.selectedImageStr = player.photoUrl;
        // IMPORTANTE: Actualizar el PhotoService con la foto preestablecida
        await this.photoService.updateUrlInput(player.photoUrl);
        console.log('[loadPlayerData] Foto pre-establecida:', player.photoUrl);
      }
    } catch (err: any) {
      console.error(
        `[loadPlayerData] ❌ Error cargando datos del jugador (ID: ${playerId}):`,
        err
      );
      console.error('[loadPlayerData] Respuesta del servidor:', err.error);
      console.error('[loadPlayerData] Status:', err.status);
      console.error('[loadPlayerData] Headers:', err.headers);

      if (err.status === 400) {
        console.error(
          '[loadPlayerData] El servidor rechazó la solicitud (400). Posibles causas:'
        );
        console.error('  1. Token de autenticación no está siendo enviado');
        console.error('  2. Token es inválido o ha expirado');
        console.error('  3. El ID del jugador no existe en la base de datos');
        console.error(
          '  4. El usuario no tiene permiso para acceder a este jugador'
        );
      } else if (err.status === 401) {
        console.error(
          '[loadPlayerData] Usuario no autorizado (401). Token inválido o expirado.'
        );
      } else if (err.status === 404) {
        console.error('[loadPlayerData] Jugador no encontrado (404).');
      }
      // No lanzar error, dejar que el usuario intente crear un nuevo jugador
      // o navegar de vuelta si desea
    }
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

        let photoUrl: string | null | undefined;

        // Usar el estado del PhotoService como fuente única de verdad
        const currentPhoto = this.photoService.currentPhotoPreview();

        if (currentPhoto) {
          // Si hay una foto, usar uploadCurrentImage que maneja:
          // - Fotos nuevas: las sube a Firebase y devuelve la URL
          // - Fotos existentes (HTTP URLs): las devuelve sin cambios
          photoUrl = await this.photoService.uploadCurrentImage(player.name);
        } else {
          photoUrl = undefined;
        }

        const playerWithPhoto: Player = {
          ...player,
          photoUrl: photoUrl || undefined,
        };

        let resultPlayer: Player;

        if (this.isEditMode && this.editingPlayerId) {
          // Modo edición: actualizar jugador existente
          resultPlayer = await this.playerService.updatePlayer(
            this.editingPlayerId,
            playerWithPhoto
          );
          console.log('Jugador actualizado:', resultPlayer);
        } else {
          // Modo creación: crear nuevo jugador
          resultPlayer = await this.playerService.createPlayer(playerWithPhoto);
          console.log('Jugador creado:', resultPlayer);
        }

        // Si sale bien, limpiamos la caché del servicio/dispositivo
        await this.photoService.clearPreviewCache();

        // Navegar a la vista de detalle del jugador recién creado o actualizado
        if (resultPlayer?.id) {
          this.navCtrl.navigateForward(`/player-detail/${resultPlayer.id}`);
        } else {
          this.navCtrl.navigateBack('/players');
        }
        // this.showToast('¡Jugador guardado de forma segura!');
      } catch (err) {
        //this.showToast('Error al almacenar los datos en el servidor.');
        console.error('Error guardando jugador:', err);
        await this.photoService.rollbackLastUpload();
      }
    } else {
      // Si el usuario fuerza el click, marcamos todo como "tocado" para iluminar los errores
      this.playerForm.markAllAsTouched();
    }
  }
}
