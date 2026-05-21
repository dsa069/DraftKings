package draftkings.eureka.client.player.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import draftkings.eureka.client.player.domain.Player;

@Repository
public interface PlayerRepository extends CrudRepository<Player, Long> {
    // Los métodos heredados de CrudRepository son suficientes: findById, findAll,
    // save, delete, etc.
}
