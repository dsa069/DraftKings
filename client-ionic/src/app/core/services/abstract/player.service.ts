import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, Subject } from 'rxjs';
import { Player } from '../../models/player.model';
import { AuthService } from './auth.service'; // Asegúrate de que la ruta sea la correcta
import { environment } from '../../../../environments/environment';

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

  // Agrega esto dentro de tu clase PlayerService en player.service.ts

  /**
   * Obtiene los jugadores desde la API externa de API-Football
   * Utiliza la clave guardada en el environment
   */
  async getExternalApiPlayers(): Promise<Player[]> {
    const apiKey = environment.apiFootballKey;

    const headers = new HttpHeaders({
      'x-apisports-key': apiKey,
      'x-rapidapi-host': 'v3.football.api-sports.io',
    });

    try {
      const res = await firstValueFrom(
        this.http.get<any>(
          'https://v3.football.api-sports.io/players/profiles',
          { headers }
        )
      );

      if (!res || !res.response || !Array.isArray(res.response)) {
        return [];
      }

      // Mapeamos la respuesta de API-Football a nuestro modelo interno Player
      return res.response.map((item: any) => ({
        name: item.player.name,
        firstName: item.player.firstname || '',
        lastName: item.player.lastname || '',
        age: item.player.age || undefined,
        birthdate: item.player.birth?.date || undefined,
        nationality: item.player.nationality || '',
        position: item.player.position || '',
        photoUrl: item.player.photo || '',
        team: 'API Football', // Por defecto ya que perfiles no siempre trae equipo directo
        league: 'External',
        latitude: 0,
        longitude: 0,
      }));
    } catch (error) {
      console.error('Error fetching from API-Football:', error);
      throw error;
    }
  }

  /**
   * Guarda múltiples jugadores seleccionados en nuestra Base de Datos
   */
  async importPlayers(players: Player[]): Promise<void> {
    const token = await this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    // Enviamos secuencialmente o mediante un Promise.all a tu endpoint de creación
    const promises = players.map((player) =>
      firstValueFrom(
        this.http.post<Player>(`${this.apiUrl}/players`, player, { headers })
      )
    );

    await Promise.all(promises);

    // Notificamos que la lista local se ha actualizado
    this.playerCreated$.next(players[0]);
  }
}
