import { Injectable } from '@angular/core';
import { TeamService } from '../abstract/team.service';
import { environment } from '../../../../environments/environment';
import { Player } from '../../models/player.model';

@Injectable()
export class TeamNodeService extends TeamService {
  protected apiUrl = environment.nodeApiUrl;

  // Placeholder para la futura llamada a la IA en Node
  async getAiRecommendations(team: Record<string, Player>): Promise<Player[]> {
    console.log(
      '[TeamNodeService] getAiRecommendations llamado (Placeholder IA)'
    );
    // TODO: Implementar en el futuro con this.http.post(...)
    return [];
  }
}
