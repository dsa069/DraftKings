import { Component, OnInit, inject } from '@angular/core';
import {
  IonContent,
  IonGrid,
  IonHeader,
  IonText,
  IonButtons,
  IonButton,
  IonBackButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { NavController, ToastController } from '@ionic/angular';
import { LoginCardComponent } from '../../shared/components/login-card/login-card.component';
import { ConfigService, BackendType } from '../../core/services/config.service';
import { addIcons } from 'ionicons';
import { arrowForwardOutline } from 'ionicons/icons';
import { BackendToggleComponent } from '../../shared/components/backend-toggle/backend-toggle.component';

@Component({
  selector: 'app-switch-back',
  templateUrl: './switch-back.page.html',
  styleUrls: ['./switch-back.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonGrid,
    IonHeader,
    IonText,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    LoginCardComponent,
    BackendToggleComponent,
  ],
})
export class SwitchBackPage implements OnInit {
  private readonly navCtrl = inject(NavController);
  private readonly toastCtrl = inject(ToastController);
  private readonly configService = inject(ConfigService);

  selectedBackend: BackendType = this.configService.selectedBackend();

  constructor() {
    addIcons({
      arrowForwardOutline,
    });
  }

  ngOnInit(): void {
    console.log('Backend actual:', this.selectedBackend);
  }

  onBackendChange(backend: BackendType): void {
    this.selectedBackend = backend;
  }

  confirmBackendChange(): void {
    console.log('Confirmando cambio de backend a:', this.selectedBackend);
    if (this.selectedBackend !== this.configService.selectedBackend()) {
      localStorage.setItem('pending_backend_change', this.selectedBackend);
      this.configService.applyBackendChange(this.selectedBackend);
    }
    this.showToast('The backend successfully switched!');
    this.navCtrl.navigateForward(['/login']);
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }
}
