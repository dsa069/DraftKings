import { Injectable } from '@angular/core';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PlayerService } from '../abstract/player.service';
import { environment } from '../../../../environments/environment';
import { Player } from '../../models/player.model';

@Injectable()
export class PlayerNodeService extends PlayerService {
  protected apiUrl = environment.nodeApiUrl;

  async getPlayers(filters?: {
    search?: string;
    team?: string;
    league?: string;
    startDate?: string;
  }): Promise<Player[]> {
    console.log('[PlayerNodeService] getPlayers llamado con filtros:', filters);
    const token = await this.authService.getToken();
    console.log(
      '[PlayerNodeService] Token obtenido:',
      token ? `${token.substring(0, 20)}...` : 'null'
    );

    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.warn(
        '[PlayerNodeService] ⚠️ Token es null, la solicitud NO incluye Authorization header'
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
    return firstValueFrom(this.http.get<Player[]>(url, { params, headers }));
  }

  async getPlayerById(id: string | number): Promise<Player> {
    console.log(`[PlayerNodeService] getPlayerById llamado con ID: ${id}`);
    const token = await this.authService.getToken();

    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.warn(`[PlayerNodeService] ⚠️ Token es null`);
    }

    const url = `${this.apiUrl}/players/${id}`;
    return firstValueFrom(this.http.get<Player>(url, { headers }));
  }

  async createPlayer(player: Player): Promise<Player> {
    const token = await this.authService.getToken();
    let headers = new HttpHeaders();

    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    const createdPlayer = await firstValueFrom(
      this.http.post<Player>(`${this.apiUrl}/players`, player, { headers })
    );

    this.playerCreated$.next(createdPlayer);
    return createdPlayer;
  }

  async updatePlayer(
    id: string | number,
    player: Partial<Player>
  ): Promise<Player> {
    const token = await this.authService.getToken();
    let headers = new HttpHeaders();

    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    const updatedPlayer = await firstValueFrom(
      this.http.put<Player>(`${this.apiUrl}/players/${id}`, player, { headers })
    );

    this.playerUpdated$.next(updatedPlayer);
    return updatedPlayer;
  }

  async deletePlayer(id: string | number): Promise<void> {
    const token = await this.authService.getToken();
    let headers = new HttpHeaders();

    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    await firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/players/${id}`, { headers })
    );

    this.playerDeleted$.next(id);
  }

  async getExternalApiPlayers(search?: string): Promise<Player[]> {
    const apiKey = environment.apiFootballKey;
    const headers = new HttpHeaders({
      'x-apisports-key': apiKey,
      'x-rapidapi-host': 'v3.football.api-sports.io',
    });

    let params = new HttpParams();
    if (search) params = params.set('search', search);

    try {
      const res = await firstValueFrom(
        this.http.get<any>(
          'https://v3.football.api-sports.io/players/profiles',
          { headers, params }
        )
      );

      if (!res || !res.response || !Array.isArray(res.response)) return [];

      return res.response.map((item: any) => ({
        name: item.player.name,
        firstName: item.player.firstname || '',
        lastName: item.player.lastname || '',
        age: item.player.age || undefined,
        birthdate: item.player.birth?.date || undefined,
        nationality: item.player.nationality || '',
        position: item.player.position || '',
        photoUrl: item.player.photo || '',
        team: 'API Football',
        league: 'External',
        latitude: 0,
        longitude: 0,
        height: item.player.height || undefined,
        weight: item.player.weight || undefined,
        number: item.player.number || undefined,
      }));
    } catch (error) {
      console.error('Error fetching from API-Football:', error);
      throw error;
    }
  }

  async importPlayers(players: Player[]): Promise<void> {
    const token = await this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    const promises = players.map((player) =>
      firstValueFrom(
        this.http.post<Player>(`${this.apiUrl}/players`, player, { headers })
      )
    );

    await Promise.all(promises);
    this.playerCreated$.next(players[0]);
  }
}
