package draftkings.eureka.client.player.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import draftkings.eureka.client.player.domain.Player;
import java.util.Date;

@Repository
public interface PlayerRepository extends CrudRepository<Player, Long> {

        // Añadimos CAST( ... AS timestamp) a la fecha para quitarle la confusión a
        // Postgres
        @Query("SELECT p FROM Player p WHERE " +
                        "(CAST(:search AS string) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) AND "
                        +
                        "(CAST(:team AS string) IS NULL OR p.team = :team) AND " +
                        "(CAST(:league AS string) IS NULL OR p.league = :league) AND " +
                        // Le devolvemos el CAST a la fecha para que Postgres sepa qué tipo de Null es
                        "(CAST(:startDate AS timestamp) IS NULL OR p.createdAt >= :startDate)")
        Page<Player> findAllWithFilters(
                        @Param("search") String search,
                        @Param("team") String team,
                        @Param("league") String league,
                        @Param("startDate") Date startDate,
                        Pageable pageable);
}