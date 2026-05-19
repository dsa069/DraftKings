// app.component.ts
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
        // 1. Si está operando en caliente en la misma pantalla, no hacemos nada.
        if (localStorage.getItem('bypass_centinela') === 'true') {
          console.log('⏳ Registro activo en pantalla. Centinela esperando...');
          return;
        }

        // Guardamos la bandera en una constante al inicio del flujo
        const isPostReloadSync =
          localStorage.getItem('execute_sync_on_reload') === 'true';

        try {
          // 2. ¿Venimos de un reload de registro con cambio de backend?
          if (isPostReloadSync) {
            console.log(
              '🔄 Sincronizando nuevo usuario tras recarga de cambio de backend...',
            );

            const pendingData = localStorage.getItem('pending_sync_data');

            try {
              if (pendingData) {
                const extraData = JSON.parse(pendingData);
                // Intentamos registrar en el NUEVO backend (Spring o Node)
                await this.authService.registerBackend(extraData);
              }

              // SI TODO VA BIEN: Limpieza total y entramos a la app
              localStorage.removeItem('pending_sync_data');
              localStorage.removeItem('execute_sync_on_reload');
              this.navCtrl.navigateRoot('/tabs/players');
              return; // Terminamos ejecución exitosa
            } catch (backendError) {
              // ❌ EL NUEVO BACKEND HA FALLADO (Ej: ERR_CONNECTION_REFUSED)
              console.error(
                '❌ El backend destino falló en la recarga. Iniciando Rollback explícito...',
              );

              // Hacemos el rollback AQUÍ, antes de que el catch de los servicios haga logout
              await this.authService.deleteCurrentUser();

              // Lanzamos un error personalizado para que el catch de abajo sepa qué hacer
              throw new Error('REGISTRATION_RELOAD_FAILED');
            }
          }

          // --- FLUJO NORMAL (Login ordinario o F5 de un usuario ya registrado) ---
          await this.authService.verifyBackend();

          if (
            window.location.hash.includes('login') ||
            window.location.hash.includes('sign-up')
          ) {
            this.navCtrl.navigateRoot('/tabs/players');
          }
        } catch (error: any) {
          console.error('❌ Error controlado por el Centinela:', error);

          // Limpieza de banderas de registro pase lo que pase
          localStorage.removeItem('pending_sync_data');
          localStorage.removeItem('execute_sync_on_reload');
          localStorage.removeItem('bypass_centinela');

          // Decidimos a dónde mandar al usuario según el tipo de fallo
          if (
            error.message === 'REGISTRATION_RELOAD_FAILED' ||
            isPostReloadSync
          ) {
            console.log(
              '↩️ Rollback completado. Devolviendo al usuario a Registro (/sign-up)',
            );

            // Forzamos el cierre de sesión residual por si acaso
            await this.authService.logout();
            this.navCtrl.navigateRoot('/sign-up');
          } else {
            console.log(
              '↩️ Validación común fallida. Devolviendo al usuario a Login (/login)',
            );
            await this.authService.logout();
            this.navCtrl.navigateRoot('/login');
          }
        }
      }
    });
  }
}
