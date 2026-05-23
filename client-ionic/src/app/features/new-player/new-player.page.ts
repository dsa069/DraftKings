import { Component, OnInit, inject } from '@angular/core';
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
  IonItem,
  IonAvatar,
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
    IonItem,
    IonAvatar,
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonImg,
    IonFooter,
    IonNote,
    HeaderSubmenuComponent,
    FormsModule,
    ReactiveFormsModule, // Vital para los formularios reactivos
  ],
})
export class NewPlayerPage implements OnInit {
  private readonly navCtrl = inject(NavController);
  private readonly fb = inject(FormBuilder);

  public playerForm!: FormGroup;

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

  onSavePlayer() {
    if (this.playerForm.valid) {
      console.log('Datos válidos listos para guardar:', this.playerForm.value);
      // Lógica de guardado...
    } else {
      // Si el usuario fuerza el click, marcamos todo como "tocado" para iluminar los errores
      this.playerForm.markAllAsTouched();
    }
  }
}
