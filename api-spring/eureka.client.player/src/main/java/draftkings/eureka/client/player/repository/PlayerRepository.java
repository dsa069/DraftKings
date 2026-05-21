package draftkings.eureka.client.player.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import draftkings.eureka.client.player.domain.Player;
import java.util.Date;

@Repository
public interface PlayerRepository extends CrudRepository<Player, Long> {
    // Pageable para soportar paginación y filtros dinámicos en la consulta de
    // jugadores
    Page<Player> findAllWithFilters(String search, String team, String league, Date startDate, Pageable pageable);
}