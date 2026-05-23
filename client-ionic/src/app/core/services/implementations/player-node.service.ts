import { Injectable } from '@angular/core';
import { PlayerService } from '../abstract/player.service';
import { Player } from '../../models/player.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

@Injectable()
export class PlayerNodeService extends PlayerService {
  protected apiUrl = environment.nodeApiUrl; //

  // Implementación del guardado de Node mediante el endpoint POST estándar
  protected saveToBackend(player: Player): Observable<Player> {
    return this.http.post<Player>(`${this.apiUrl}/players`, player);
  }
}
