import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonBackButton,
  IonImg,
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-header-submenu',
  templateUrl: './header-submenu.component.html',
  styleUrls: ['./header-submenu.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonBackButton,
    IonImg,
  ],
})
export class HeaderSubmenuComponent {
  private readonly navCtrl = inject(NavController);

  constructor() {}

  async goToHome(): Promise<void> {
    this.navCtrl.navigateForward(['/']);
  }
}
