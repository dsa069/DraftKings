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
// Importa tu PlayerService para obtener la lista de jugadores de la BD
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
    PlayerListComponent,
    HeaderComponent,
  ],
})
export class MyTeamPage implements OnInit {
  private teamService = inject(TeamService);
  private playerService = inject(PlayerService);
  // Estado del equipo: Mapa de Posición -> Jugador
  teamPositions = signal<Record<string, Player>>({});

  // Lista de todos los jugadores de tu BD para pasárselos al PlayerList
  allPlayers = signal<Player[]>([]);

  // Control del modal
  isModalOpen = signal<boolean>(false);
  currentEditingPosition = signal<string>('');

  constructor() {
    addIcons({
      optionsOutline,
      sparkles,
      bulb,
      gitNetworkOutline,
    });
  }

  async ngOnInit() {
    // 1. Cargar el equipo guardado en Preferences
    const savedTeam = await this.teamService.getTeam();
    this.teamPositions.set(savedTeam);

    // 2. Cargar la lista de jugadores de tu BD
    // (Ajusta este método según cómo funcione tu PlayerService)
    const players = await this.playerService.getPlayers();
    this.allPlayers.set(players);
  }

  // Abre el modal y guarda qué posición estamos editando
  openPlayerSelection(position: string) {
    this.currentEditingPosition.set(position);
    this.isModalOpen.set(true);
  }

  // Se ejecuta cuando el usuario elige un jugador en la lista
  async onPlayerSelected(player: Player) {
    const position = this.currentEditingPosition();
    if (position) {
      // Actualizamos el diccionario
      const currentTeam = this.teamPositions();
      const updatedTeam = { ...currentTeam, [position]: player };

      this.teamPositions.set(updatedTeam);

      // Guardamos en Preferences
      await this.teamService.saveTeam(updatedTeam);
    }

    // Cerramos el modal
    this.isModalOpen.set(false);
  }

  // Cierra el modal manualmente (ej. botón de cancelar o click fuera)
  closeModal() {
    this.isModalOpen.set(false);
  }
}
