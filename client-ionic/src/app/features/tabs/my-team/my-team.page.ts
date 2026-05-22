import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonText,
  IonButton,
  IonIcon,
  IonBadge,
  IonChip,
  IonLabel,
  IonAvatar,
  IonImg,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { addIcons } from 'ionicons';
import {
  optionsOutline,
  sparkles,
  bulb,
  gitNetworkOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-my-team',
  templateUrl: 'my-team.page.html',
  styleUrls: ['my-team.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonText,
    IonButton,
    IonIcon,
    IonBadge,
    IonChip,
    IonLabel,
    IonAvatar,
    IonImg,
    HeaderComponent,
  ],
})
export class MyTeamPage {
  constructor() {
    addIcons({
      optionsOutline,
      sparkles,
      bulb,
      gitNetworkOutline,
    });
  }
}
