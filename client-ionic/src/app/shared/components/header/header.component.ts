import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonImg,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { logInOutline, logOutOutline, footballOutline } from 'ionicons/icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonImg,
  ],
})
export class HeaderComponent {
  constructor() {
    addIcons({
      'log-in-outline': logInOutline,
      'log-out-outline': logOutOutline,
      'football-outline': footballOutline,
    });
  }
}
