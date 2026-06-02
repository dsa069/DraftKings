package draftkings.eureka.client.user.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import draftkings.eureka.client.user.domain.User;

@Repository
public interface UserRepository extends CrudRepository<User, Long> {
    User findByFirebaseUid(String firebaseUid);
}
