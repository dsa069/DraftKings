import { ConfigService } from '../config.service';
import { ReviewSpringService } from '../implementations/review-spring.service';
import { ReviewNodeService } from '../implementations/review-node.service';

export function reviewFactory(
  config: ConfigService,
  springService: ReviewSpringService,
  nodeService: ReviewNodeService
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
