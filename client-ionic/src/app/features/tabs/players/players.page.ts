import { Component, signal, computed } from '@angular/core';
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
  IonBadge,
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
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-players',
  templateUrl: 'players.page.html',
  styleUrls: ['players.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
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
    IonBadge,
    HeaderComponent,
  ],
})
export class PlayersPage {
  showFilters = signal<boolean>(false);
  // Señales para controlar el estado de los filtros
  selectedTeam = signal<string>('');
  selectedLeague = signal<string>('');

  // Computado que evalúa si hay algún filtro activo (no vacío)
  hasActiveFilters = computed<boolean>(() => {
    return this.selectedTeam() !== '' || this.selectedLeague() !== '';
  });

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
