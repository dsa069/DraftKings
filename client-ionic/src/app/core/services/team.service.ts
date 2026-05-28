// src/app/core/services/team.service.ts
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Subject } from 'rxjs';
import { Player } from '../models/player.model';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private readonly TEAM_KEY = 'my_starting_xi';
  // Notifica a componentes que el equipo fue limpiado
  teamCleared$ = new Subject<void>();

  constructor() {}

  // Recupera el equipo guardado (un diccionario donde la clave es la posición)
  async getTeam(): Promise<Record<string, Player>> {
    const { value } = await Preferences.get({ key: this.TEAM_KEY });
    return value ? JSON.parse(value) : {};
  }

  // Guarda el equipo actual en el almacenamiento local
  async saveTeam(team: Record<string, Player>): Promise<void> {
    await Preferences.set({
      key: this.TEAM_KEY,
      value: JSON.stringify(team),
    });
  }

  // Limpia solo el equipo guardado en preferences
  async clearTeam(): Promise<void> {
    await Preferences.remove({ key: this.TEAM_KEY });
    this.teamCleared$.next();
  }
}
