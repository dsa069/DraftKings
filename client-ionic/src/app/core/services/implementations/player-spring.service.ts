import { Injectable } from '@angular/core';
import { PlayerService } from '../abstract/player.service';
import { environment } from '../../../../environments/environment';

@Injectable()
export class PlayerSpringService extends PlayerService {
  // Solo definimos la URL base para el microservicio de Spring Boot
  protected apiUrl = environment.springApiUrl + '/playerms/api';
}
