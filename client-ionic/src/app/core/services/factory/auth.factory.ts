import { ConfigService } from '../config.service';
import { AuthSpringService } from '../implementations/auth-spring.service';
import { AuthNodeService } from '../implementations/auth-node.service';

export function authFactory(config: ConfigService) {
  // CORRECCIÓN: Usar la señal pública
  const selected = config.selectedBackend();

  switch (selected) {
    case 'springboot': // Asegúrate de que coincida con tu BackendType
      return new AuthSpringService();
    // case 'firebase': // Si en el futuro quieres agregar Firebase, aquí iría el caso
    case 'node':
    default:
      return new AuthNodeService();
  }
}
