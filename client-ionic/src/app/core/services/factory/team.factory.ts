import { ConfigService } from '../config.service';
import { TeamNodeService } from '../implementations/team-node.service';
import { TeamSpringService } from '../implementations/team-spring.service';

export function teamFactory(config: ConfigService) {
  // CORRECCIÓN: Usar la señal pública
  const selected = config.selectedBackend();

  switch (selected) {
    case 'springboot': // Asegúrate de que coincida con tu BackendType
      return new TeamSpringService();
    // case 'firebase': // Si en el futuro quieres agregar Firebase, aquí iría el caso
    case 'node':
    default:
      return new TeamNodeService();
  }
}
