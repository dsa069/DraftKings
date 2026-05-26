import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
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
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonDatetimeButton,
  IonPopover,
  IonNote,
} from '@ionic/angular/standalone';
import { Player } from '../../../core/models/player.model';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  optionsOutline,
  funnelOutline,
  chevronDownOutline,
  closeOutline,
  star,
  starHalf,
} from 'ionicons/icons';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
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
    IonItemGroup,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonDatetimeButton,
    IonPopover,
    IonNote,
  ],
})
export class PlayerListComponent {
  // Recibimos los jugadores desde el padre y actualizamos una señal interna
  private _players = signal<Player[]>([]);
  @Input({ required: true }) set players(value: Player[]) {
    this._players.set(value || []);
  }

  // Emitimos el ID del jugador al componente padre para que maneje la navegación
  @Output() playerClick = new EventEmitter<string | undefined>();

  // Señales locales para filtros y búsqueda
  showFilters = signal<boolean>(false);
  searchText = signal<string>('');
  selectedTeam = signal<string>('');
  selectedLeague = signal<string>('');
  selectedDate = signal<string | null>(null);

  // Computed para filtrar jugadores
  filteredPlayers = computed<Player[]>(() => {
    const playersList = this._players();

    if (!Array.isArray(playersList)) {
      return [];
    }

    const search = this.searchText().toLowerCase();
    const team = this.selectedTeam();
    const league = this.selectedLeague();
    const date = this.selectedDate();

    return playersList.filter((player) => {
      const playerName =
        `${player.firstName} ${player.lastName} ${player.name}`.toLowerCase();
      const matchesSearch = search === '' || playerName.includes(search);
      const matchesTeam = team === '' || player.team === team;
      const matchesLeague = league === '' || player.league === league;
      const matchesDate = date === null || this.isDateInRange(player, date);

      return matchesSearch && matchesTeam && matchesLeague && matchesDate;
    });
  });

  hasActiveFilters = computed<boolean>(() => {
    return (
      this.selectedTeam() !== '' ||
      this.selectedLeague() !== '' ||
      this.selectedDate() !== null ||
      this.searchText() !== ''
    );
  });

  uniqueTeams = computed<string[]>(() => {
    const teams = new Set<string>();
    const playersList = this._players();
    if (Array.isArray(playersList)) {
      playersList.forEach((player) => {
        if (player.team) teams.add(player.team);
      });
    }
    return Array.from(teams).sort();
  });

  uniqueLeagues = computed<string[]>(() => {
    const leagues = new Set<string>();
    const playersList = this._players();
    if (Array.isArray(playersList)) {
      playersList.forEach((player) => {
        if (player.league) leagues.add(player.league);
      });
    }
    return Array.from(leagues).sort();
  });

  constructor() {
    addIcons({
      searchOutline,
      optionsOutline,
      star,
      starHalf,
      funnelOutline,
      chevronDownOutline,
      closeOutline,
    });
  }

  toggleFilters(): void {
    this.showFilters.update((value) => !value);
  }

  onSearchChange(event: any): void {
    this.searchText.set(event.detail.value || '');
  }

  clearSearchFilter(): void {
    this.searchText.set('');
  }

  clearTeamFilter(): void {
    this.selectedTeam.set('');
  }

  clearLeagueFilter(): void {
    this.selectedLeague.set('');
  }

  clearDateFilter(event: Event): void {
    event.stopPropagation();
    this.selectedDate.set(null);
  }

  onDateChange(event: any): void {
    const value = event.detail.value;
    this.selectedDate.set(value ? String(value) : null);
  }

  private isDateInRange(player: Player, selectedDate: string): boolean {
    if (!player.birthdate && !player.created_at) return false;

    const selectedDateFormatted = selectedDate.split('T')[0];
    const playerDate = player.created_at || player.birthdate;
    if (!playerDate) return false;

    const playerDateFormatted = playerDate.toString().split('T')[0];
    return playerDateFormatted === selectedDateFormatted;
  }

  onPlayerClick(playerId: number | string | undefined): void {
    this.playerClick.emit(playerId?.toString());
  }
}
