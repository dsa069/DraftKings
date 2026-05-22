import { Component, signal } from '@angular/core';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonItemGroup,
  IonCol,
  IonItem,
  IonIcon,
  IonInput,
  IonButton,
  IonList,
  IonAvatar,
  IonImg,
  IonLabel,
  IonText,
  IonFab,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  optionsOutline,
  funnelOutline,
  chevronDownOutline,
  star,
  starHalf,
  add,
} from 'ionicons/icons';

@Component({
  selector: 'app-players',
  templateUrl: 'players.page.html',
  styleUrls: ['players.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonIcon,
    IonInput,
    IonButton,
    IonList,
    IonAvatar,
    IonImg,
    IonLabel,
    IonText,
    IonFab,
    IonItemGroup,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    HeaderComponent,
  ],
})
export class PlayersPage {
  showFilters = signal<boolean>(false);

  constructor() {
    // Registramos los iconos equivalentes a los que usabas de Material Symbols
    addIcons({
      searchOutline,
      optionsOutline,
      star,
      starHalf,
      add,
      funnelOutline,
      chevronDownOutline,
    });
  }

  toggleFilters(): void {
    this.showFilters.update((value) => !value);
  }
}
