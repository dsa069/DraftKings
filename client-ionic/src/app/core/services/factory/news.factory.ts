import { ConfigService } from '../config.service';
import { NewsSpringService } from '../implementations/news-spring.service';
import { NewsNodeService } from '../implementations/news-node.service';

export function NewsFactory(config: ConfigService) {
  // CORRECCIÓN: Usar la señal pública
  const selected = config.selectedBackend();

  switch (selected) {
    case 'springboot': // Asegúrate de que coincida con tu BackendType
      return new NewsSpringService();
    // case 'firebase': // Si en el futuro quieres agregar Firebase, aquí iría el caso
    case 'node':
    default:
      return new NewsNodeService();
  }
}
