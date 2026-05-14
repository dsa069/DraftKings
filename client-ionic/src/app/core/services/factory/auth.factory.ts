import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../config.service';
import { AuthSpringService } from '../abstract/auth-spring.service';
import { AuthNodeService } from '../abstract/auth-node.service';

export function authFactory(http: HttpClient, config: ConfigService) {
  const selected = config.getBackendType();

  switch (selected) {
    case 'SPRING':
      return new AuthSpringService(http);
    //case 'FIREBASE':
    // return new AuthFirebaseService(http); <-- Fácil de añadir
    case 'NODE':
    default:
      return new AuthNodeService(http);
  }
}
