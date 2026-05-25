import { Injectable } from '@angular/core';
import { PlayerService } from '../abstract/player.service';
import { environment } from '../../../../environments/environment';

@Injectable()
export class PlayerNodeService extends PlayerService {
  // Solo definimos la URL base para Node
  protected apiUrl = environment.nodeApiUrl;
}
