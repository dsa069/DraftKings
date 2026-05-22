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
import { AuthService } from '../../../core/services/abstract/auth.service';

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
  private readonly authService = inject(AuthService);

  public readonly isLogged = this.authService.isAuthenticated;

  constructor() {
    addIcons({
      'log-in-outline': logInOutline,
      'log-out-outline': logOutOutline,
      'football-outline': footballOutline,
    });
  }
  async goToHome(): Promise<void> {
    this.navCtrl.navigateForward(['/']);
  }

  async goToLogin(): Promise<void> {
    this.navCtrl.navigateForward(['/login']);
  }

  async closeSession(): Promise<void> {
    await this.authService.logout();
    this.goToLogin();
  }
}
