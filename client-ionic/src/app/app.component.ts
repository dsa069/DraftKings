// app.component.ts
import { Component, effect, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private navCtrl = inject(NavController);
  private toastCtrl = inject(ToastController);

  constructor() {
    effect(async () => {
      if (localStorage.getItem('pending_backend_change')) {
        localStorage.removeItem('pending_backend_change');
        this.navCtrl.navigateRoot('/login');
        this.showToast('The backend successfully switched!');
      }
    });
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
