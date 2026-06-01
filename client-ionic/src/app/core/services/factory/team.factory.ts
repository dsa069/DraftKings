import { ConfigService } from '../config.service';
import { TeamNodeService } from '../implementations/team-node.service';
import { TeamSpringService } from '../implementations/team-spring.service';

export function teamFactory(
  config: ConfigService,
  springService: TeamSpringService,
  nodeService: TeamNodeService
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
