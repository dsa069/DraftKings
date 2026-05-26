import {
  Component,
  signal,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  IonContent,
  IonIcon,
  IonButton,
  IonText,
  IonFab,
  IonSpinner,
  IonNote,
  IonCard,
  IonCardContent,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PlayerService } from '../../../core/services/abstract/player.service';
import { Player } from '../../../core/models/player.model';
import { addIcons } from 'ionicons';
import { add, cloudDownloadOutline } from 'ionicons/icons';
import { NavController } from '@ionic/angular';
import { PlayerListComponent } from '../../../shared/components/player-list/player-list.component';

@Component({
  selector: 'app-players',
  templateUrl: 'players.page.html',
  styleUrls: ['players.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonIcon,
    IonButton,
    IonText,
    IonFab,
    IonSpinner,
    IonNote,
    IonCard,
    IonCardContent,
    HeaderComponent,
    PlayerListComponent, // Importamos el nuevo componente hijo
  ],
})
export class PlayersPage implements OnInit {
  private readonly navCtrl = inject(NavController);
  private readonly playerService = inject(PlayerService);
  private readonly cdr = inject(ChangeDetectorRef);

  allPlayers = signal<Player[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    addIcons({ add, cloudDownloadOutline });
  }

  async ngOnInit(): Promise<void> {
    await this.loadPlayers();

    this.playerService.playerCreated$.subscribe(() => this.loadPlayers());
    this.playerService.playerUpdated$.subscribe(() => this.loadPlayers());
    this.playerService.playerDeleted$.subscribe(() => this.loadPlayers());
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadPlayers();
  }

  private async loadPlayers(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

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

      if (!Array.isArray(players)) {
        throw new Error(
          'Invalid API response format: expected an array of players'
        );
      }

      this.allPlayers.set(players);
      this.cdr.markForCheck();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error loading players';
      this.errorMessage.set(errorMsg);
      console.error('Error loading players:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  goToAddPlayer(): void {
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur();
    this.navCtrl.navigateForward('/new-player');
  }

  goToImportPlayers(): void {
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur();
    this.navCtrl.navigateForward('/import-players');
  }

  goToPlayerDetail(playerId: string | undefined): void {
    if (!playerId) return;
    this.navCtrl.navigateForward(`/player-detail/${playerId}`);
  }
}
