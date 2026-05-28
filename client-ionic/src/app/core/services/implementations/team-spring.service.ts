import { Injectable } from '@angular/core';
import { TeamService } from '../abstract/team.service';
import { environment } from '../../../../environments/environment';
import { Player } from '../../models/player.model';

@Injectable()
export class TeamSpringService extends TeamService {
  // Ajustamos el path según el microservicio correspondiente si aplica
  protected apiUrl = environment.springApiUrl + '/playerms/api';

  // Placeholder para la futura llamada a la IA en Spring
  async getAiRecommendations(team: Record<string, Player>): Promise<Player[]> {
    console.log(
      '[TeamSpringService] getAiRecommendations llamado (Placeholder IA)'
    );
    // TODO: Implementar en el futuro con this.http.post(...)
    return [];
  }
}
