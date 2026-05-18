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

  // app.component.ts
  constructor() {
    effect(async () => {
      if (this.authService.isAuthenticated()) {
        // PERSPECTIVA NUEVA 1: Si la página está operando en caliente, no interfieras.
        if (localStorage.getItem('bypass_centinela') === 'true') {
          console.log('⏳ Registro activo en pantalla. Centinela esperando...');
          return;
        }

        try {
          // PERSPECTIVA NUEVA 2: ¿Venimos de un reload de registro?
          if (localStorage.getItem('execute_sync_on_reload') === 'true') {
            console.log(
              '🔄 Detectada recarga de registro. Sincronizando en el nuevo backend...',
            );

            const pendingData = localStorage.getItem('pending_sync_data');
            if (pendingData) {
              const extraData = JSON.parse(pendingData);
              await this.authService.registerBackend(extraData);
            }

            // Sincronización exitosa: Limpiamos el rastro inmediatamente
            localStorage.removeItem('pending_sync_data');
            localStorage.removeItem('execute_sync_on_reload');

            // Forzamos salida directa a la app principal
            this.navCtrl.navigateRoot('/tabs/players');
            return;
          }

          // --- FLUJO NORMAL (Login exitoso o F5 ordinario) ---
          await this.authService.verifyBackend();

          if (
            window.location.hash.includes('login') ||
            window.location.hash.includes('sign-up')
          ) {
            this.navCtrl.navigateRoot('/tabs/players');
          }
        } catch (error) {
          console.error('❌ Error de validación/sincronización en backend');
          localStorage.removeItem('pending_sync_data');
          localStorage.removeItem('execute_sync_on_reload');
          localStorage.removeItem('bypass_centinela');
          await this.authService.logout();
          this.navCtrl.navigateRoot('/login');
        }
      }
    });
  }
}
