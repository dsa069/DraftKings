import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { Subject } from 'rxjs';
import { Player } from '../../models/player.model';
import { AiRecommendation } from '../../models/aiRecommendation.model';
import { AuthService } from './auth.service';

@Injectable()
export abstract class TeamService {
  // Cada backend definirá su propia URL base
  protected abstract apiUrl: string;

  // Dejamos las inyecciones listas para cuando los hijos hagan peticiones HTTP
  protected http = inject(HttpClient);
  protected authService = inject(AuthService);

  private readonly TEAM_KEY = 'my_starting_xi';

  // Notifica a componentes que el equipo fue limpiado
  readonly teamCleared$ = new Subject<void>();

  // Notifica a componentes que el equipo fue guardado/modificado
  readonly teamSaved$ = new Subject<Record<string, Player>>();

  // MÉTODOS COMUNES (Se ejecutan localmente a través de Capacitor)
  async getTeam(): Promise<Record<string, Player>> {
    const { value } = await Preferences.get({ key: this.TEAM_KEY });
    return value ? JSON.parse(value) : {};
  }

  async saveTeam(team: Record<string, Player>): Promise<void> {
    await Preferences.set({
      key: this.TEAM_KEY,
      value: JSON.stringify(team),
    });
    this.teamSaved$.next(team);
  }

  async clearTeam(): Promise<void> {
    await Preferences.remove({ key: this.TEAM_KEY });
    this.teamCleared$.next();
  }

  // MÉTODO ABSTRACTO: Cada backend lo implementará a su manera
  abstract getAiRecommendations(
    team: Record<string, Player>,
    formationPositions: string[]
  ): Promise<AiRecommendation>;
}
