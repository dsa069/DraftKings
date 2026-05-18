import { Component, effect, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './core/services/abstract/auth.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
// app.component.ts
export class AppComponent {
  private authService = inject(AuthService);
  private navCtrl = inject(NavController);

  constructor() {
    // Este efecto se ejecuta cada vez que 'isAuthenticated' cambia
    // Incluyendo el momento justo después del reload.
    effect(async () => {
      if (this.authService.isAuthenticated()) {
        try {
          // El "revisor" comprueba si el usuario existe en el backend actual
          await this.authService.verifyBackend();
          console.log('✅ Verificación post-reload exitosa');

          // Si estamos en login, lo mandamos dentro
          if (window.location.hash.includes('login')) {
            this.navCtrl.navigateRoot('/tabs/players');
          }
        } catch (error) {
          console.error('❌ El usuario no existe en este backend');
          await this.authService.logout();
          this.navCtrl.navigateRoot('/login');
        }
      }
    });
  }
}
