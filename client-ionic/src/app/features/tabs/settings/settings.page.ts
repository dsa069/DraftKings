import { Component, OnInit, inject, signal, computed } from '@angular/core';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
  IonBadge,
  IonSpinner,
  IonAvatar,
  IonImg,
  IonButton,
  IonIcon,
  IonText,
  IonChip,
  IonToggle,
} from '@ionic/angular/standalone';

// Si usas Ionic 18/Angular 18 standalone, debes registrar los iconos a importar:
import { addIcons } from 'ionicons';
import {
  pencil,
  star,
  moon,
  //arrowForwardUp,
  globe,
  chevronDown,
  lockClosed,
  fingerPrint,
  server,
  terminal,
  logOut,
} from 'ionicons/icons';

import { HeaderComponent } from '../../../shared/components/header/header.component';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/abstract/auth.service';
import { ConfigService } from '../../../core/services/config.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonList,
    IonBadge,
    IonSpinner,
    IonAvatar,
    IonImg,
    IonButton,
    IonIcon,
    IonText,
    IonChip,
    IonToggle,
    HeaderComponent,
  ],
})
export class SettingsPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly configService = inject(ConfigService);

  readonly #userProfile = signal<User | null>(null);
  public readonly userProfile = this.#userProfile.asReadonly();
  public readonly isAdmin = computed(
    () => this.userProfile()?.role === 'ADMIN'
  );
  public readonly currentBackendLabel = computed(() =>
    this.configService.selectedBackend() === 'springboot'
      ? 'Spring Boot'
      : 'Node.js'
  );

  constructor() {
    // Registrar los iconos nativos utilizados en el HTML
    addIcons({
      pencil,
      star,
      moon,
      //'arrow-forward-up': arrowForwardUp,
      globe,
      'chevron-down': chevronDown,
      'lock-closed': lockClosed,
      'finger-print': fingerPrint,
      server,
      terminal,
      'log-out': logOut,
    });
  }

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.#userProfile.set(profile);
        console.log('Perfil cargado en Signal:', this.userProfile());
      },
      error: (err) => console.error('Error cargando perfil', err),
    });
  }
}
