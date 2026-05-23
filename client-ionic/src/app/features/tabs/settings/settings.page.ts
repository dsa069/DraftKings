import { Component, OnInit, inject, signal, computed } from '@angular/core';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonAvatar,
  IonImg,
  IonButton,
  IonIcon,
  IonText,
  IonChip,
  IonToggle,
  IonItemGroup,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  pencil,
  star,
  moon,
  globe,
  arrowForwardOutline,
  chevronDown,
  lockClosed,
  fingerPrint,
  server,
  terminal,
  logOut,
  logoNodejs,
  leafOutline,
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
    IonCardContent,
    IonItem,
    IonLabel,
    IonList,
    IonAvatar,
    IonImg,
    IonButton,
    IonIcon,
    IonText,
    IonChip,
    IonToggle,
    IonItemGroup,
    HeaderComponent,
  ],
})
export class SettingsPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly configService = inject(ConfigService);
  public readonly nodeBackendIcon = logoNodejs;
  public readonly springBackendIcon = leafOutline;

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
  public readonly currentBackendIcon = computed(() =>
    this.configService.selectedBackend() === 'springboot'
      ? this.springBackendIcon
      : this.nodeBackendIcon
  );

  constructor() {
    addIcons({
      pencil,
      star,
      moon,
      globe,
      arrowForwardOutline,
      chevronDown,
      lockClosed,
      fingerPrint,
      server,
      terminal,
      logOut,
      logoNodejs,
      leafOutline,
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
