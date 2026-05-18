import { Component, effect, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './core/services/abstract/auth.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private authService = inject(AuthService);
  private navCtrl = inject(NavController);

  constructor() {
    effect(async () => {
      if (this.authService.isAuthenticated()) {
        // 1. Si estamos en medio de un proceso de registro activo en esta misma pantalla,
        // no hacemos nada, dejamos que la lógica de sign-up.page termine.
        const isRegistering = localStorage.getItem('is_registering');

        // Si estamos en la página de registro y acabamos de darle al botón,
        // el effect se dispara pero este IF lo detiene.
        if (isRegistering && window.location.hash.includes('sign-up')) {
          console.log('⏳ Registro en curso... Centinela en espera.');
          return;
        }

        try {
          const pendingData = localStorage.getItem('pending_sync_data');

          if (pendingData) {
            // Esto solo se ejecutará si hubo un RELOAD (porque el isRegistering se mantiene)
            console.log('🔄 Sincronizando nuevo usuario tras recarga...');
            const extraData = JSON.parse(pendingData);
            await this.authService.registerBackend(extraData);
            localStorage.removeItem('pending_sync_data');
            localStorage.removeItem('is_registering');
          } else {
            await this.authService.verifyBackend();
          }

          if (
            window.location.hash.includes('login') ||
            window.location.hash.includes('sign-up')
          ) {
            this.navCtrl.navigateRoot('/tabs/players');
          }
        } catch (error) {
          console.error('❌ Error de validación');
          localStorage.removeItem('pending_sync_data');
          localStorage.removeItem('is_registering');
          await this.authService.logout();
          this.navCtrl.navigateRoot('/login');
        }
      }
    });
  }
}
