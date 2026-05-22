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
    HeaderComponent,
  ],
})
export class PlayersPage {
  showFilters = signal<boolean>(false);
  // Señales para controlar el estado de los filtros
  selectedTeam = signal<string>('');
  selectedLeague = signal<string>('');

  selectedDate = signal<string | null>(null);

  hasActiveFilters = computed<boolean>(() => {
    return (
      this.selectedTeam() !== '' ||
      this.selectedLeague() !== '' ||
      this.selectedDate() !== null
    );
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

  // Método para limpiar el filtro de fecha
  clearDateFilter(event: Event): void {
    event.stopPropagation();
    this.selectedDate.set(null);
  }

  // Capturar el cambio de fecha desde el ion-datetime
  onDateChange(event: any): void {
    const value = event.detail.value;
    this.selectedDate.set(value ? String(value) : null);
  }
}
