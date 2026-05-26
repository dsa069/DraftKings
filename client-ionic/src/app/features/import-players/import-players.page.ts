import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonNote,
  IonToast,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { PlayerListComponent } from '../../shared/components/player-list/player-list.component';
import { PlayerService } from '../../core/services/abstract/player.service';
import { Player } from '../../core/models/player.model';
import { NavController } from '@ionic/angular';
import { HeaderSubmenuComponent } from '../../shared/components/header-submenu/header-submenu.component';

@Component({
  selector: 'app-import-players',
  templateUrl: './import-players.page.html',
  styleUrls: ['./import-players.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSpinner,
    IonNote,
    IonToast,
    IonButtons,
    IonBackButton,
    PlayerListComponent,
    HeaderSubmenuComponent,
  ],
})
export class ImportPlayersPage implements OnInit {
  private readonly playerService = inject(PlayerService);
  private readonly navCtrl = inject(NavController);

  externalPlayers = signal<Player[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  showToast = signal<boolean>(false);
  toastMessage = signal<string>('');

  ngOnInit() {
    this.loadExternalPlayers();
  }

  async loadExternalPlayers() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const players = await this.playerService.getExternalApiPlayers();
      this.externalPlayers.set(players);
    } catch (err) {
      this.errorMessage.set('Could not load data from API Football.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async handleImport(playersToImport: Player[]) {
    this.isLoading.set(true);
    try {
      await this.playerService.importPlayers(playersToImport);
      this.toastMessage.set(
        `Successfully imported ${playersToImport.length} players!`
      );
      this.showToast.set(true);

      // Regresar a la vista principal tras el éxito
      setTimeout(() => {
        this.navCtrl.navigateBack('/players');
      }, 1500);
    } catch (err) {
      this.toastMessage.set('Error saving players to DB.');
      this.showToast.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }
}
