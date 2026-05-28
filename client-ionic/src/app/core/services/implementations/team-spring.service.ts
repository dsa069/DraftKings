import { Injectable } from '@angular/core';
import { TeamService } from '../abstract/team.service';
import { environment } from '../../../../environments/environment';
import { Player } from '../../models/player.model';
import { AiRecommendation } from '../../models/aiRecommendation.model';
import { HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TeamSpringService extends TeamService {
  // Ajustamos el path según el microservicio correspondiente si aplica
  protected apiUrl = environment.springApiUrl + '/playerms/api/tactics';

  async getAiRecommendations(
    team: Record<string, Player>,
    formationPositions: string[] // <--- NUEVO PARÁMETRO
  ): Promise<AiRecommendation> {
    const token = await this.authService.getToken();
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    const positionsPayload: Record<string, string | null> = {};

    // ITERAMOS SOBRE TODAS LAS POSICIONES POSIBLES, NO SOLO LAS OCUPADAS
    formationPositions.forEach((pos) => {
      positionsPayload[pos] = team[pos]?.name || null;
    });

    return firstValueFrom(
      this.http.post<AiRecommendation>(
        `${this.apiUrl}/recommendations`,
        { positions: positionsPayload },
        { headers }
      )
    );
  }
}
