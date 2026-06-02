import { ConfigService } from '../config.service';
import { PlayerSpringService } from '../implementations/player-spring.service';
import { PlayerNodeService } from '../implementations/player-node.service';

export function playerFactory(
  config: ConfigService,
  springService: PlayerSpringService,
  nodeService: PlayerNodeService
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
