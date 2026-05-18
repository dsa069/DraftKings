//Patron Strategy
import { Injectable } from '@angular/core';
import { PlayerService } from '../abstract/player.service';
import { environment } from '../../../../environments/environment.prod';

@Injectable()
export class PlayerSpringService extends PlayerService {
  protected apiUrl = environment.springApiUrl + '/playerms';
}
