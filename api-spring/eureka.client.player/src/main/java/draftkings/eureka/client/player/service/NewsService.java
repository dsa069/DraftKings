package draftkings.eureka.client.player.service;

import draftkings.eureka.client.player.dto.NewsDTO;
import java.util.List;

public interface NewsService {
    List<NewsDTO> getAllNews();

    NewsDTO getNewsById(Long id);

    NewsDTO createNews(NewsDTO newsDTO);
}