import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../config.service';
import { PlayerNodeService } from '../abstract/player-node.service';
import { PlayerSpringService } from '../abstract/player-spring.service';

export function playerFactory(http: HttpClient, config: ConfigService) {
  const selected = config.getBackendType();

  switch (selected) {
    case 'SPRING':
      return new PlayerSpringService(http);
    //case 'FIREBASE':
    // return new PlayerFirebaseService(http); <-- Fácil de añadir
    case 'NODE':
    default:
      return new PlayerNodeService(http);
  }
}
