import { Injectable } from '@angular/core';
import { PlayerService } from '../abstract/player.service';
import { Player } from '../../models/player.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

@Injectable()
export class PlayerSpringService extends PlayerService {
  protected apiUrl = environment.springApiUrl + '/playerms'; //

  // Implementación del guardado de Spring Boot mediante su arquitectura de microservicios
  protected saveToBackend(player: Player): Observable<Player> {
    return this.http.post<Player>(`${this.apiUrl}/players`, player);
  }
}
