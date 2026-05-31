import {
  Component,
  OnInit,
  signal,
  inject,
  computed,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonText,
  IonButton,
  IonIcon,
  IonBadge,
  IonChip,
  IonLabel,
  IonAvatar,
  IonImg,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonSpinner,
  IonItem,
  IonList,
  IonListHeader,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { addIcons } from 'ionicons';
import { TeamService } from '../../../core/services/abstract/team.service';
import { Player } from '../../../core/models/player.model';
import { PlayerListComponent } from '../../../shared/components/player-list/player-list.component';
import { PlayerService } from '../../../core/services/abstract/player.service';
import {
  optionsOutline,
  sparkles,
  bulb,
  gitNetworkOutline,
  arrowUndoOutline,
  chatbubblesOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/abstract/auth.service';

@Component({
  selector: 'app-my-team',
  templateUrl: 'my-team.page.html',
  styleUrls: ['my-team.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonText,
    IonButton,
    IonIcon,
    IonBadge,
    IonChip,
    IonLabel,
    IonAvatar,
    IonImg,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonSpinner,
    IonItem,
    IonList,
    IonListHeader,
    HeaderComponent,
    PlayerListComponent, // <- Asegúrate de importar el componente aquí
  ],
})
export class MyTeamPage implements OnInit, OnDestroy {
  private teamClearedSub?: Subscription;
  private teamService = inject(TeamService);
  private playerService = inject(PlayerService);
  private authService = inject(AuthService);

  public teamPositions = signal<Record<string, Player>>({});
  public allPlayers = signal<Player[]>([]);
  public isLoadingPlayers = signal<boolean>(false); // Para mostrar el spinner en el list
  public isModalOpen = signal<boolean>(false);
  public currentEditingPosition = signal<string>('');
  public aiMessage = signal<string>(
    'Tap to get AI recommendations for your squad.'
  );
  public aiNarrative = signal<string>('');
  public aiRecommendations = signal<Record<string, string>>({});
  public hasAiResponse = signal<boolean>(false);
  public isAiLoading = signal<boolean>(false);

  public readonly isAuthenticated = this.authService.isAuthenticated;

  public aiRecommendationsArray = computed(() => {
    const recommendations = this.aiRecommendations();

    return Object.keys(recommendations).map((position) => ({
      position,
      playerName: recommendations[position],
    }));
  });

  availablePlayers = computed(() => {
    const all = this.allPlayers();
    const team = this.teamPositions();
    const currentPos = this.currentEditingPosition();

    // Extraemos los IDs de los jugadores que ya están ocupando OTRAS posiciones
    const busyPlayerIds = Object.entries(team)
      .filter(([pos, player]) => pos !== currentPos && player) // Ignoramos la posición actual
      .map(([pos, player]) => player?.id?.toString())
      .filter((id): id is string => id !== undefined);

    // Devolvemos solo los jugadores que NO estén en la lista de ocupados
    return all.filter((player) => {
      const id = player.id?.toString();
      return !id || !busyPlayerIds.includes(id);
    });
  });

  constructor() {
    addIcons({
      optionsOutline,
      sparkles,
      bulb,
      gitNetworkOutline,
      arrowUndoOutline,
      chatbubblesOutline,
    });
  }

  async ngOnInit() {
    // 1. Cargamos tu alineación guardada
    const savedTeam = await this.teamService.getTeam();
    this.teamPositions.set(savedTeam);

    // Nos suscribimos para limpiar el estado en memoria cuando se borre el equipo
    this.teamClearedSub = this.teamService.teamCleared$.subscribe(() => {
      this.teamPositions.set({});
      this.resetAiAdviceState();
    });

    // 2. Cargamos los jugadores de la BD (con la lógica a prueba de fallos)
    await this.loadPlayersFromDB();
  }

  ngOnDestroy(): void {
    this.teamClearedSub?.unsubscribe();
  }

  // Mismo método de extracción que tienes en players.page.ts
  async loadPlayersFromDB() {
    this.isLoadingPlayers.set(true);
    try {
      const response = await this.playerService.getPlayers();

      let players: Player[] = [];
      if (Array.isArray(response)) {
        players = response;
      } else if (
        response &&
        typeof response === 'object' &&
        !Array.isArray(response)
      ) {
        const data = response as Record<string, any>;
        players =
          data['content'] ||
          data['data'] ||
          data['players'] ||
          data['results'] ||
          [];
      }

      this.allPlayers.set(players);
    } catch (error) {
      console.error('Error loading players for the team:', error);
    } finally {
      this.isLoadingPlayers.set(false);
    }
  }

  openPlayerSelection(position: string) {
    this.currentEditingPosition.set(position);
    this.isModalOpen.set(true);
  }

  // Recibe el ID (string) que emite tu player-list por defecto
  async onPlayerSelected(playerId: string | undefined) {
    if (!playerId) return;

    const position = this.currentEditingPosition();
    // Buscamos el jugador completo en nuestra lista local
    const selectedPlayer = this.allPlayers().find(
      (p) => p.id?.toString() === playerId
    );

    if (position && selectedPlayer) {
      // Actualizamos UI
      const currentTeam = this.teamPositions();
      const updatedTeam = { ...currentTeam, [position]: selectedPlayer };
      this.teamPositions.set(updatedTeam);

      // Guardamos en Preferences
      await this.teamService.saveTeam(updatedTeam);
    }

    this.isModalOpen.set(false);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  private resetAiAdviceState() {
    this.aiNarrative.set('');
    this.aiRecommendations.set({});
    this.hasAiResponse.set(false);
    this.isAiLoading.set(false);
  }

  async requestAiAdvice() {
    this.isAiLoading.set(true);

    try {
      const currentTeam = this.teamPositions();
      const currentFormationPositions = [
        'GK',
        'RB',
        'RCB',
        'LCB',
        'LB',
        'RCM',
        'CDM',
        'LCM',
        'RW',
        'ST',
        'LW',
      ];

      // Pasamos el array como segundo parámetro
      const response = await this.teamService.getAiRecommendations(
        currentTeam,
        currentFormationPositions
      );

      this.aiNarrative.set(response.message);
      this.aiRecommendations.set(response.recommendations || {});
      this.hasAiResponse.set(true);
    } catch (error) {
      console.error('Error requesting AI advice:', error);
      this.aiNarrative.set(
        'Could not load AI advice at this time. Please try again.'
      );
      this.aiRecommendations.set({});
      this.hasAiResponse.set(true);
    } finally {
      this.isAiLoading.set(false);
    }
  }
}
