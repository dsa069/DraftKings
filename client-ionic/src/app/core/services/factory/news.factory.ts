import { ConfigService } from '../config.service';
import { NewsSpringService } from '../implementations/news-spring.service';
import { NewsNodeService } from '../implementations/news-node.service';

export function NewsFactory(
  config: ConfigService,
  springService: NewsSpringService,
  nodeService: NewsNodeService
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
