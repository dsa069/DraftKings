import { ConfigService } from '../config.service';
import { AuthSpringService } from '../implementations/auth-spring.service';
import { AuthNodeService } from '../implementations/auth-node.service';

export function authFactory(
  config: ConfigService,
  springService: AuthSpringService,
  nodeService: AuthNodeService
) {
  const selected = config.selectedBackend();

  switch (selected) {
    case 'springboot':
      return springService;
    case 'node':
    default:
      return nodeService;
  }
}
