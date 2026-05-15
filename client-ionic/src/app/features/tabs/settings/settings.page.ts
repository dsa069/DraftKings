import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { User } from '../../../core/models/user.model';
import { inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/abstract/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, HeaderComponent],
})
export class SettingsPage {
  private authService = inject(AuthService);

  // Usamos una señal para guardar el usuario
  public user = signal<User | null>(null);

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (userData) => this.user.set(userData),
      error: (err) => console.error('Error cargando perfil', err),
    });
  }
  constructor() {}
}
