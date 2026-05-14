import { ConfigService } from '../config.service';
import { ReviewNodeService } from '../abstract/review-node.service';
import { ReviewSpringService } from '../abstract/review-spring.service';

export function reviewFactory(config: ConfigService) {
  const selected = config.getBackendType();

  switch (selected) {
    case 'SPRING':
      return new ReviewSpringService();
    //case 'FIREBASE':
    // return new ReviewFirebaseService(); <-- Fácil de añadir
    case 'NODE':
    default:
      return new ReviewNodeService();
  }
}
