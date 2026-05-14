//Patron Strategy
import { Injectable } from '@angular/core';
import { PlayerService } from '../implementations/player.service';

@Injectable()
export class PlayerSpringService extends PlayerService {
  protected apiUrl = 'http://localhost:3000';
}
