import { HttpClient } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
import { Player } from '../../models/player.model';
import { Injectable, inject } from '@angular/core';

@Injectable()
export abstract class PlayerService {
  protected abstract apiUrl: string;
  protected http = inject(HttpClient);

  getPlayer(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.apiUrl}/players`);
  }

  async createPlayer(player: Player): Promise<Player> {
    return await lastValueFrom(this.saveToBackend(player));
  }

  protected abstract saveToBackend(player: Player): Observable<Player>;
}
