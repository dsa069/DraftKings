import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, Subject } from 'rxjs';
import { Player } from '../../models/player.model';
import { AuthService } from './auth.service'; // Asegúrate de que la ruta sea la correcta

@Injectable()
export abstract class PlayerService {
  protected abstract apiUrl: string;
  protected http = inject(HttpClient);
  protected authService = inject(AuthService); // Inyectamos Auth para obtener el token

  // Subject para notificar cuando se crea un nuevo jugador
  playerCreated$ = new Subject<Player>();

  // 3) Obtener listado de jugadores (con filtros opcionales)
  async getPlayers(filters?: {
    search?: string;
    team?: string;
    league?: string;
    startDate?: string;
  }): Promise<Player[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.team) params = params.set('team', filters.team);
      if (filters.league) params = params.set('league', filters.league);
      if (filters.startDate)
        params = params.set('startDate', filters.startDate);
    }

    return firstValueFrom(
      this.http.get<Player[]>(`${this.apiUrl}/players`, { params })
    );
  }

  // 4) Obtener detalle de un jugador
  async getPlayerById(id: number): Promise<Player> {
    return firstValueFrom(
      this.http.get<Player>(`${this.apiUrl}/players/${id}`)
    );
  }

  // 5) Crear un jugador (Requiere JWT)
  async createPlayer(player: Player): Promise<Player> {
    const token = await this.authService.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const createdPlayer = await firstValueFrom(
      this.http.post<Player>(`${this.apiUrl}/players`, player, {
        headers,
      })
    );

    // Emitir evento para notificar que se creó un nuevo jugador
    this.playerCreated$.next(createdPlayer);

    return createdPlayer;
  }

  // 7) Editar datos de un jugador (Requiere JWT)
  async updatePlayer(id: number, player: Partial<Player>): Promise<Player> {
    const token = await this.authService.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return firstValueFrom(
      this.http.put<Player>(`${this.apiUrl}/players/${id}`, player, {
        headers,
      })
    );
  }

  // 8) Eliminar un jugador (Requiere JWT)
  async deletePlayer(id: number): Promise<void> {
    const token = await this.authService.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/players/${id}`, {
        headers,
      })
    );
  }
}
