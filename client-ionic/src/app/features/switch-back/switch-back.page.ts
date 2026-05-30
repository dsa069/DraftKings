import { Component, OnInit, inject } from '@angular/core';
import {
  IonContent,
  IonGrid,
  IonHeader,
  IonText,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, arrowBackOutline } from 'ionicons/icons';
import { NavController } from '@ionic/angular';
import { LoginCardComponent } from '../../shared/components/login-card/login-card.component';
import { ConfigService, BackendType } from '../../core/services/config.service';

// Asegúrate de usar la ruta correcta hacia el componente
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
    LoginCardComponent,
    BackendToggleComponent,
  ],
})
export class SwitchBackPage implements OnInit {
  private readonly navCtrl = inject(NavController);
  private readonly configService = inject(ConfigService);

  selectedBackend: BackendType = this.configService.selectedBackend();

  constructor() {
    addIcons({
      arrowForwardOutline,
      arrowBackOutline,
    });
  }

  ngOnInit(): void {
    console.log('Backend actual:', this.selectedBackend);
  }

  // <-- Nuevo método para manejar el cambio
  onBackendChange(backend: BackendType): void {
    this.selectedBackend = backend;
    // this.configService.setBackend(backend); // Opcional: si necesitas actualizar el servicio global
  }

  gotoSignUp(): void {
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur();
    this.navCtrl.navigateForward(['/switch-back']);
  }
}
