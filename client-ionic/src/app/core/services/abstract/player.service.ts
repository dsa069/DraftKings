import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { Player } from '../../models/player.model';
import { AuthService } from './auth.service';

@Injectable()
export abstract class PlayerService {
  protected abstract apiUrl: string;
  protected http = inject(HttpClient);
  protected authService = inject(AuthService);

  // Subjects para notificar cambios en jugadores
  readonly playerCreated$ = new Subject<Player>();
  readonly playerUpdated$ = new Subject<Player>();
  readonly playerDeleted$ = new Subject<string | number>();

  abstract getPlayers(filters?: {
    search?: string;
    team?: string;
    league?: string;
    startDate?: string;
  }): Promise<Player[]>;

  abstract getPlayerById(id: string | number): Promise<Player>;

  abstract createPlayer(player: Player): Promise<Player>;

  abstract updatePlayer(
    id: string | number,
    player: Partial<Player>
  ): Promise<Player>;

  abstract deletePlayer(id: string | number): Promise<void>;

  abstract getExternalApiPlayers(search?: string): Promise<Player[]>;

  abstract importPlayers(players: Player[]): Promise<void>;
}
