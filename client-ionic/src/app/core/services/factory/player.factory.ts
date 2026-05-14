import { ConfigService } from '../config.service';
import { PlayerNodeService } from '../abstract/player-node.service';
import { PlayerSpringService } from '../abstract/player-spring.service';

export function playerFactory(config: ConfigService) {
  const selected = config.getBackendType();

  switch (selected) {
    case 'SPRING':
      return new PlayerSpringService();
    //case 'FIREBASE':
    // return new PlayerFirebaseService(); <-- Fácil de añadir
    case 'NODE':
    default:
      return new PlayerNodeService();
  }
}
