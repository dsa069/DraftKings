import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../config.service';
import { ReviewNodeService } from '../abstract/review-node.service';
import { ReviewSpringService } from '../abstract/review-spring.service';

export function reviewFactory(http: HttpClient, config: ConfigService) {
  const selected = config.getBackendType();

  switch (selected) {
    case 'SPRING':
      return new ReviewSpringService(http);
    //case 'FIREBASE':
    // return new ReviewFirebaseService(http); <-- Fácil de añadir
    case 'NODE':
    default:
      return new ReviewNodeService(http);
  }
}
