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

  // Subjects para notificar cambios en jugadores
  playerCreated$ = new Subject<Player>();
  playerUpdated$ = new Subject<Player>();
  playerDeleted$ = new Subject<string | number>();

  // 3) Obtener listado de jugadores (con filtros opcionales)
  async getPlayers(filters?: {
    search?: string;
    team?: string;
    league?: string;
    startDate?: string;
  }): Promise<Player[]> {
    console.log('[PlayerService] getPlayers llamado con filtros:', filters);
    const token = await this.authService.getToken();
    console.log(
      '[PlayerService] Token obtenido:',
      token ? `${token.substring(0, 20)}...` : 'null'
    );

    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log('[PlayerService] Authorization header agregado');
    } else {
      console.warn(
        '[PlayerService] ⚠️ Token es null, la solicitud NO incluye Authorization header'
      );
    }

    let params = new HttpParams();

    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.team) params = params.set('team', filters.team);
      if (filters.league) params = params.set('league', filters.league);
      if (filters.startDate)
        params = params.set('startDate', filters.startDate);
    }

    const url = `${this.apiUrl}/players`;
    console.log('[PlayerService] GET', url);

    return firstValueFrom(this.http.get<Player[]>(url, { params, headers }));
  }

  // 4) Obtener detalle de un jugador
  async getPlayerById(id: string | number): Promise<Player> {
    console.log(`[PlayerService] getPlayerById llamado con ID: ${id}`);
    const token = await this.authService.getToken();
    console.log(
      `[PlayerService] Token obtenido:`,
      token ? `${token.substring(0, 20)}...` : 'null'
    );

    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log(`[PlayerService] Authorization header agregado`);
    } else {
      console.warn(
        `[PlayerService] ⚠️ Token es null, la solicitud NO incluye Authorization header`
      );
    }

    const url = `${this.apiUrl}/players/${id}`;
    console.log(`[PlayerService] GET ${url}`);
    console.log(`[PlayerService] Headers que se envían:`, headers.keys());

    return firstValueFrom(this.http.get<Player>(url, { headers }));
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
  async updatePlayer(
    id: string | number,
    player: Partial<Player>
  ): Promise<Player> {
    const token = await this.authService.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const updatedPlayer = await firstValueFrom(
      this.http.put<Player>(`${this.apiUrl}/players/${id}`, player, {
        headers,
      })
    );

    // Emitir evento para notificar que se actualizó un jugador
    this.playerUpdated$.next(updatedPlayer);

    return updatedPlayer;
  }

  // 8) Eliminar un jugador (Requiere JWT)
  async deletePlayer(id: string | number): Promise<void> {
    const token = await this.authService.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    await firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/players/${id}`, {
        headers,
      })
    );

    // Emitir evento para notificar que se eliminó un jugador
    this.playerDeleted$.next(id);
  }
}
