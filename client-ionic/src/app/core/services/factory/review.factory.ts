import { ConfigService } from '../config.service';
import { ReviewNodeService } from '../implementations/review-node.service';
import { ReviewSpringService } from '../implementations/review-spring.service';

export function reviewFactory(config: ConfigService) {
  // CORRECCIÓN: Usar la señal pública
  const selected = config.selectedBackend();

  switch (selected) {
    case 'springboot': // Asegúrate de que coincida con tu BackendType
      return new ReviewSpringService();
    // case 'firebase': // Si en el futuro quieres agregar Firebase, aquí iría el caso
    case 'node':
    default:
      return new ReviewNodeService();
  }
}
