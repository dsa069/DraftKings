import { Component, signal, computed, inject, OnInit } from '@angular/core';
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
  IonPopover,
  IonSpinner,
  IonNote,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PlayerService } from '../../../core/services/abstract/player.service';
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
  add,
} from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';

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
    IonPopover,
    IonSpinner,
    IonNote,
    HeaderComponent,
  ],
})
export class PlayersPage implements OnInit {
  private readonly navCtrl = inject(NavController);
  private readonly playerService = inject(PlayerService);

  // Señales para datos
  allPlayers = signal<Player[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Señales para filtros y búsqueda
  showFilters = signal<boolean>(false);
  searchText = signal<string>('');
  selectedTeam = signal<string>('');
  selectedLeague = signal<string>('');
  selectedDate = signal<string | null>(null);

  // Computed para filtrar jugadores
  filteredPlayers = computed<Player[]>(() => {
    const players = this.allPlayers();

    // Validar que players es un array
    if (!Array.isArray(players)) {
      console.warn('allPlayers no es un array:', players);
      return [];
    }

    const search = this.searchText().toLowerCase();
    const team = this.selectedTeam();
    const league = this.selectedLeague();
    const date = this.selectedDate();

    return players.filter((player) => {
      // Filtro de búsqueda por nombre
      const playerName =
        `${player.firstName} ${player.lastName} ${player.name}`.toLowerCase();
      const matchesSearch = search === '' || playerName.includes(search);

      // Filtro por equipo
      const matchesTeam = team === '' || player.team === team;

      // Filtro por liga
      const matchesLeague = league === '' || player.league === league;

      // Filtro por fecha (si existe created_at en el Player)
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

  // Computed para obtener equipos únicos
  uniqueTeams = computed<string[]>(() => {
    const teams = new Set<string>();
    const players = this.allPlayers();
    if (Array.isArray(players)) {
      players.forEach((player) => {
        if (player.team) teams.add(player.team);
      });
    }
    return Array.from(teams).sort();
  });

  // Computed para obtener ligas únicas
  uniqueLeagues = computed<string[]>(() => {
    const leagues = new Set<string>();
    const players = this.allPlayers();
    if (Array.isArray(players)) {
      players.forEach((player) => {
        if (player.league) leagues.add(player.league);
      });
    }
    return Array.from(leagues).sort();
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
      closeOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadPlayers();
  }

  private async loadPlayers(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await this.playerService.getPlayers();
      console.log('Players API Response:', response);

      // Manejar diferentes formatos de respuesta de la API
      let players: Player[] = [];
      if (Array.isArray(response)) {
        players = response;
      } else if (
        response &&
        typeof response === 'object' &&
        !Array.isArray(response)
      ) {
        // Intentar extraer array de propiedades comunes
        const data = response as Record<string, any>;
        players =
          data['content'] ||
          data['data'] ||
          data['players'] ||
          data['results'] ||
          [];
      }

      // Validar que es un array válido
      if (!Array.isArray(players)) {
        throw new Error(
          'Formato de respuesta inválido: no se encontró array de jugadores'
        );
      }

      this.allPlayers.set(players);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error al cargar jugadores';
      this.errorMessage.set(errorMsg);
      console.error('Error cargando jugadores:', error);
    } finally {
      this.isLoading.set(false);
    }
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

  // Métodos de limpieza para cada filtro separado
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

  // Capturar el cambio de fecha desde el ion-datetime
  onDateChange(event: any): void {
    const value = event.detail.value;
    this.selectedDate.set(value ? String(value) : null);
  }

  // Verificar si la fecha del jugador está en el rango seleccionado
  private isDateInRange(player: Player, selectedDate: string): boolean {
    if (!player.birthdate && !player.created_at) return false;

    // Convertir la fecha seleccionada al formato YYYY-MM-DD
    const selectedDateFormatted = selectedDate.split('T')[0];

    // Buscar coincidencia con birthdate o created_at
    const playerDate = player.created_at || player.birthdate;
    if (!playerDate) return false;

    const playerDateFormatted = playerDate.toString().split('T')[0];
    return playerDateFormatted === selectedDateFormatted;
  }

  goToAddPlayer(): void {
    // Para evitar que el botón quede "pegado" al teclado en móviles, forzamos el blur del elemento activo antes de navegar
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur();
    this.navCtrl.navigateForward('/new-player');
  }

  goToPlayerDetail(playerId: string | undefined): void {
    if (!playerId) return;
    // Navegar a la página de detalles del jugador con el ID como parámetro
    this.navCtrl.navigateForward(`/player-detail/${playerId}`);
  }

  getPlayerIdString(playerId: number | undefined): string {
    return playerId?.toString() || '';
  }
}
