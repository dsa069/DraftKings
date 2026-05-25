import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonBadge,
  IonButton,
  IonIcon,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonSpinner,
  IonNote,
  IonList,
} from '@ionic/angular/standalone';
import { HeaderSubmenuComponent } from '../../shared/components/header-submenu/header-submenu.component';
import { Player } from '../../core/models/player.model';
import { PlayerService } from '../../core/services/abstract/player.service';
import { addIcons } from 'ionicons';
import {
  pencil,
  informationCircle,
  chatbox,
  person,
  star,
  starOutline,
  send,
  documentText,
} from 'ionicons/icons';

@Component({
  selector: 'app-player-detail',
  templateUrl: './player-detail.page.html',
  styleUrls: ['./player-detail.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonBadge,
    IonButton,
    IonIcon,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonSpinner,
    IonNote,
    IonList,
    DatePipe,
    NgStyle,
    HeaderSubmenuComponent,
    FormsModule,
  ],
})
export class PlayerDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly playerService = inject(PlayerService);

  player = signal<Player | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    // Registramos los íconos globalmente para este componente standalone
    addIcons({
      pencil,
      informationCircle,
      chatbox,
      person,
      star,
      starOutline,
      send,
      documentText,
    });
  }

  async ngOnInit(): Promise<void> {
    // Obtener el ID del jugador de los parámetros de la ruta
    const playerId = this.route.snapshot.paramMap.get('id');

    if (!playerId) {
      this.errorMessage.set('ID de jugador no válido');
      return;
    }

    await this.loadPlayerDetail(playerId);
  }

  private async loadPlayerDetail(playerId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Convertir playerId a número si es necesario
      const playerIdNum = isNaN(Number(playerId)) ? playerId : Number(playerId);
      const playerData = await this.playerService.getPlayerById(
        playerIdNum as any
      );
      this.player.set(playerData);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'Error al cargar detalles del jugador';
      this.errorMessage.set(errorMsg);
      console.error('Error cargando jugador:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
