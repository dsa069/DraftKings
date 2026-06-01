import { Component, inject } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  ToastController, // <-- 1. Añadimos ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  shieldHalfOutline,
  peopleOutline,
  settingsOutline,
  newspaperOutline,
} from 'ionicons/icons';

// <-- 2. Importamos el AuthService (ajusta la ruta si es distinta)
import { AuthService } from '../../core/services/abstract/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  private authService = inject(AuthService);
  private toastCtrl = inject(ToastController);

  public readonly isAuthenticated = this.authService.isAuthenticated;

  constructor() {
    addIcons({
      shieldHalfOutline,
      peopleOutline,
      settingsOutline,
      newspaperOutline,
    });
  }

  // 5. Método que llamaremos desde el HTML
  async showAuthToast() {
    await this.showToast('Please log in or register to access this feature.');
  }

  // 6. Tu método KISS
  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'tertiary',
    });
    await toast.present();
  }
}
