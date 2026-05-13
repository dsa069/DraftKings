import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonImg,
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
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
  private readonly navCtrl = inject(NavController);

  constructor() {
    addIcons({
      'log-in-outline': logInOutline,
      'log-out-outline': logOutOutline,
      'football-outline': footballOutline,
    });
  }

  goToLogin(): void {
    //Si cierra sesión se limpia el stack
    this.navCtrl.navigateRoot(['/login']);
  }
}
