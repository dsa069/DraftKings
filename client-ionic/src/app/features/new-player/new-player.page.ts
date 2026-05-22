import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
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
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { addIcons } from 'ionicons';
import { person, camera, location } from 'ionicons/icons';

@Component({
  selector: 'app-new-player',
  templateUrl: './new-player.page.html',
  styleUrls: ['./new-player.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
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
    HeaderComponent,
    FormsModule,
  ],
})
export class NewPlayerPage implements OnInit {
  constructor() {
    // Registramos los íconos globalmente para este standalone component
    addIcons({ person, camera, location });
  }

  ngOnInit() {
    // Temporal para que el linter no de error
    console.log('NewPlayerPage inicializado');
  }
}
