import { Component, inject, Input } from '@angular/core';
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
import { addIcons } from 'ionicons';
import { chevronBackCircleOutline } from 'ionicons/icons';

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

  @Input() title = 'DRAFTKINGS';
  @Input() href = '/';

  constructor() {
    addIcons({
      'chevron-back-circle-outline': chevronBackCircleOutline,
    });
  }

  async goToHome(): Promise<void> {
    this.navCtrl.navigateForward(['/']);
  }
}
