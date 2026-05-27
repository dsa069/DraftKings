import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonNote, IonToast } from '@ionic/angular/standalone';
import { PlayerListComponent } from '../../shared/components/player-list/player-list.component';
import { PlayerService } from '../../core/services/abstract/player.service';
import { Player } from '../../core/models/player.model';
import { NavController } from '@ionic/angular';
import { HeaderSubmenuComponent } from '../../shared/components/header-submenu/header-submenu.component';
import { LocationService } from '../../core/services/abstract/location.service';

@Component({
  selector: 'app-import-players',
  templateUrl: './import-players.page.html',
  styleUrls: ['./import-players.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonNote,
    IonToast,
    PlayerListComponent,
    HeaderSubmenuComponent,
  ],
})
export class ImportPlayersPage implements OnInit {
  private readonly playerService = inject(PlayerService);
  private readonly navCtrl = inject(NavController);
  private readonly locationService = inject(LocationService);

  externalPlayers = signal<Player[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  showToast = signal<boolean>(false);
  toastMessage = signal<string>('');

  ngOnInit() {
    this.loadExternalPlayers();
  }

  // 1. Modifica el método para aceptar el parámetro opcional
  async loadExternalPlayers(search?: string) {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const players = await this.playerService.getExternalApiPlayers(search);
      this.externalPlayers.set(players);
    } catch (err) {
      this.errorMessage.set('Could not load data from API Football.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // 2. Agrega este nuevo método para capturar la búsqueda del componente
  onSearchChange(searchText: string) {
    const query = searchText.trim();

    if (query.length >= 3) {
      this.loadExternalPlayers(query); // Busca en la API externa
    } else if (query === '') {
      this.loadExternalPlayers(); // Recarga la lista por defecto si borra el texto
    }
  }

  async handleImport(playersToImport: Player[]) {
    this.isLoading.set(true);
    try {
      // 1. Pedimos la ubicación nativa del dispositivo
      const deviceLocation =
        await this.locationService.requestDeviceCurrentPosition();

      // Extraemos las coordenadas (si falla el GPS, por defecto dejamos 0)
      const currentLat = deviceLocation?.lat || 0;
      const currentLng = deviceLocation?.lng || 0;

      // 2. Modificamos los jugadores para inyectarles la ubicación real
      const playersWithLocation = playersToImport.map((player) => ({
        ...player,
        latitude: currentLat,
        longitude: currentLng,
      }));

      // 3. Pasamos los jugadores modificados al servicio (sea Node o Spring)
      await this.playerService.importPlayers(playersWithLocation);

      this.toastMessage.set(
        `Successfully imported ${playersWithLocation.length} players!`
      );
      this.showToast.set(true);

      // Regresar a la vista principal tras el éxito
      setTimeout(() => {
        this.navCtrl.navigateBack('/tabs/players');
      }, 1500);
    } catch (err) {
      this.toastMessage.set('Error importing players. Please try again.');
      this.showToast.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }
}
