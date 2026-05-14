import { ConfigService } from '../config.service';
import { PlayerSpringService } from '../abstract/player-spring.service';
import { PlayerNodeService } from '../abstract/player-node.service';

export function playerFactory(config: ConfigService) {
  // CORRECCIÓN: Usar la señal pública
  const selected = config.selectedBackend();

  switch (selected) {
    case 'springboot': // Asegúrate de que coincida con tu BackendType
      return new PlayerSpringService();
    // case 'firebase': // Si en el futuro quieres agregar Firebase, aquí iría el caso
    case 'node':
    default:
      return new PlayerNodeService();
  }
}
