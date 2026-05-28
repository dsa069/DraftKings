import { Component, OnInit, signal, inject } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { addIcons } from 'ionicons';
import { TeamService } from '../../../core/services/team.service';
import { Player } from '../../../core/models/player.model';
import { PlayerListComponent } from '../../../shared/components/player-list/player-list.component';
import { PlayerService } from '../../../core/services/abstract/player.service';
import {
  optionsOutline,
  sparkles,
  bulb,
  gitNetworkOutline,
} from 'ionicons/icons';

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
    HeaderComponent,
    PlayerListComponent, // <- Asegúrate de importar el componente aquí
  ],
})
export class MyTeamPage implements OnInit {
  teamPositions = signal<Record<string, Player>>({});
  allPlayers = signal<Player[]>([]);
  isLoadingPlayers = signal<boolean>(false); // Para mostrar el spinner en el list

  isModalOpen = signal<boolean>(false);
  currentEditingPosition = signal<string>('');

  private teamService = inject(TeamService);
  private playerService = inject(PlayerService);

  constructor() {
    addIcons({ optionsOutline, sparkles, bulb, gitNetworkOutline });
  }

  async ngOnInit() {
    // 1. Cargamos tu alineación guardada
    const savedTeam = await this.teamService.getTeam();
    this.teamPositions.set(savedTeam);

    // 2. Cargamos los jugadores de la BD (con la lógica a prueba de fallos)
    await this.loadPlayersFromDB();
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
      console.error('Error cargando jugadores para el Team:', error);
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
}
