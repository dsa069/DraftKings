import { ConfigService } from '../config.service';
import { AuthSpringService } from '../abstract/auth-spring.service';
import { AuthNodeService } from '../abstract/auth-node.service';

export function authFactory(config: ConfigService) {
  const selected = config.getBackendType();

  switch (selected) {
    case 'SPRING':
      return new AuthSpringService();
    //case 'FIREBASE':
    // return new AuthFirebaseService(); <-- Fácil de añadir
    case 'NODE':
    default:
      return new AuthNodeService();
  }
}
