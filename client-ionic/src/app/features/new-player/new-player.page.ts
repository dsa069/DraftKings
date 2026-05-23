import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonText,
  IonItem,
  IonAvatar,
  IonIcon,
  IonButton,
  IonCard,
  IonCardContent,
  IonImg,
  IonFooter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, camera, location, saveOutline } from 'ionicons/icons';
import { NavController } from '@ionic/angular';
import { HeaderSubmenuComponent } from '../../shared/components/header-submenu/header-submenu.component';

@Component({
  selector: 'app-new-player',
  templateUrl: './new-player.page.html',
  styleUrls: ['./new-player.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonText,
    IonItem,
    IonAvatar,
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonImg,
    IonFooter,
    HeaderSubmenuComponent,
    FormsModule,
  ],
})
export class NewPlayerPage implements OnInit {
  private readonly navCtrl = inject(NavController);

  constructor() {
    // Registramos los íconos globalmente para este standalone component
    addIcons({ person, camera, location, saveOutline });
  }

  ngOnInit() {
    // Temporal para que el linter no de error
    console.log('NewPlayerPage inicializado');
  }

  onSavePlayer() {
    // Aquí iría la lógica para guardar el nuevo jugador
    console.log('Guardar jugador');
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur();
    this.navCtrl.navigateForward(['/player-detail']);
  }
}
