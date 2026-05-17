import { Component, OnInit, inject, signal, computed } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonBadge,
  IonSpinner,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/abstract/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonList,
    IonBadge,
    IonSpinner,
    HeaderComponent,
  ],
})
export class SettingsPage implements OnInit {
  // Implementamos la interfaz
  private readonly authService = inject(AuthService);

  // 1. Signal privada: donde guardamos el dato real
  readonly #userProfile = signal<User | null>(null);

  // 2. Signal pública (Readonly): lo que el HTML consume
  public readonly userProfile = this.#userProfile.asReadonly();

  // 3. Signal computada (opcional): ejemplo de lógica derivada
  public readonly isAdmin = computed(
    () => this.userProfile()?.role === 'ADMIN',
  );

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        // Actualizamos la signal privada
        this.#userProfile.set(profile);
        console.log('Perfil cargado en Signal:', this.userProfile());
      },
      error: (err) => console.error('Error cargando perfil', err),
    });
  }
}
