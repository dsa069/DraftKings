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
  IonCheckbox,
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
  checkbox,
  squareOutline,
  downloadOutline,
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
    IonCheckbox,
  ],
})
export class PlayerListComponent {
  // Modo de visualización por defecto: 'view'. Cambia a 'import' desde la otra vista.
  @Input() mode: 'view' | 'import' = 'view';

  private _players = signal<Player[]>([]);
  @Input({ required: true }) set players(value: Player[]) {
    this._players.set(value || []);
  }

  @Output() playerClick = new EventEmitter<string | undefined>();
  @Output() importSelected = new EventEmitter<Player[]>(); // Evento para enviar los elegidos
  @Output() searchChange = new EventEmitter<string>();

  // Control de selección múltiple para el modo Import
  selectedPlayers = signal<Map<string | number, Player>>(new Map());

  showFilters = signal<boolean>(false);
  searchText = signal<string>('');
  selectedTeam = signal<string>('');
  selectedLeague = signal<string>('');
  selectedDate = signal<string | null>(null);

  filteredPlayers = computed<Player[]>(() => {
    const playersList = this._players();
    if (!Array.isArray(playersList)) return [];

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
    this._players().forEach((p) => p.team && teams.add(p.team));
    return Array.from(teams).sort();
  });

  uniqueLeagues = computed<string[]>(() => {
    const leagues = new Set<string>();
    this._players().forEach((p) => p.league && leagues.add(p.league));
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
      checkbox,
      squareOutline,
      downloadOutline,
    });
  }

  toggleFilters(): void {
    this.showFilters.update((value) => !value);
  }

  onSearchChange(event: any): void {
    const value = event.detail.value || '';
    this.searchText.set(value);
    this.searchChange.emit(value); // <-- Emitimos el valor
  }

  clearSearchFilter(): void {
    this.searchText.set('');
    this.searchChange.emit(''); // <-- Emitimos vacío al limpiar
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
    return playerDate.toString().split('T')[0] === selectedDateFormatted;
  }

  // Lógica de clic adaptiva según el modo activo
  onPlayerClick(player: Player): void {
    if (this.mode === 'import') {
      const identifier = player.id || player.name; // Usar name si no tiene ID en la API externa
      const currentMap = new Map(this.selectedPlayers());

      if (currentMap.has(identifier)) {
        currentMap.delete(identifier);
      } else {
        currentMap.set(identifier, player);
      }
      this.selectedPlayers.set(currentMap);
    } else {
      this.playerClick.emit(player.id?.toString());
    }
  }

  isPlayerSelected(player: Player): boolean {
    return this.selectedPlayers().has(player.id || player.name);
  }

  emitImport(): void {
    const playersToImport = Array.from(this.selectedPlayers().values());
    if (playersToImport.length > 0) {
      this.importSelected.emit(playersToImport);
    }
  }
}
