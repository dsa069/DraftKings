//Patron Strategy
import { Injectable } from '@angular/core';
import { PlayerService } from '../abstract/player.service';

@Injectable()
export class PlayerNodeService extends PlayerService {
  protected apiUrl = 'http://localhost:3000';
}
