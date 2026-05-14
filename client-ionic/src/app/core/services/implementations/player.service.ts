import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player } from '../../models/player.model';

export abstract class PlayerService {
  protected abstract apiUrl: string; // Cada hijo dirá su URL

  constructor(protected http: HttpClient) {}

  getPlayer(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.apiUrl}/players`);
  }
  // ... el resto de métodos CRUD aquí una sola vez
}
