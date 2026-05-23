import { Component, OnInit, inject } from '@angular/core';
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
  IonCard,
  IonCardContent,
  IonImg,
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
    IonCard,
    IonCardContent,
    IonImg,
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
  private readonly navCtrl = inject(NavController);
  private readonly fb = inject(FormBuilder);
  private readonly playerService = inject(PlayerService);
  private readonly photoService = inject(PhotoService);

  public selectedImageStr: string | null = null;

  public playerForm!: FormGroup;

  // No need for direct child access — the PlayerService centraliza el estado.

  constructor() {
    addIcons({ person, camera, location, saveOutline });
    this.initForm();
  }

  ngOnInit() {
    console.log('NewPlayerPage inicializado');
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
          // Lat/long obligatorios en la interfaz; usamos 0 por defecto si no hay ubicación
          latitude: 0,
          longitude: 0,
        };

        const photoUrl = await this.photoService.uploadCurrentImage(
          player.name
        );

        const playerWithPhoto: Player = {
          ...player,
          photoUrl: photoUrl || undefined,
        };

        await this.playerService.createPlayer(playerWithPhoto);

        // Si sale bien, limpiamos la caché del servicio/dispositivo
        await this.photoService.clearPreviewCache();
        this.navCtrl.navigateBack('/player-detail');
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
