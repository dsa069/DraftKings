package draftkings.eureka.client.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import draftkings.eureka.client.user.repository.UserRepository;
import draftkings.eureka.client.user.domain.User;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository; // Tu repositorio JPA para PostgreSQL

    @PostMapping("/sync-user")
    public String syncUserToPostgres(@AuthenticationPrincipal Jwt jwt, @RequestBody User additionalData) {
        // 1. Extraer datos del JWT validado por Spring Security
        String firebaseUid = jwt.getSubject(); // El 'subject' en Firebase es el UID
        String email = jwt.getClaimAsString("email");

        // 2. Verificar si el usuario ya existe en PostgreSQL
        User existingUser = userRepository.findByFirebaseUid(firebaseUid);
        if (existingUser != null) {
            return "Usuario ya sincronizado";
        }

        // 3. Crear el usuario en Postgres con la lógica de negocio
        User newUser = new User();
        newUser.setFirebaseUid(firebaseUid);
        newUser.setEmail(email);
        newUser.setUserName(additionalData.getUserName());
        newUser.setRole("ROLE_USER"); // O el rol por defecto de tu MS

        userRepository.save(newUser);

        return "Usuario registrado en PostgreSQL con éxito";
    }

    @GetMapping("/api/auth/me")
    public ResponseEntity<User> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        // El 'sub' del JWT es el UID de Firebase
        String uid = jwt.getSubject();

        return userRepository.findByFirebaseUid(uid) != null ? ResponseEntity.ok(userRepository.findByFirebaseUid(uid))
                : ResponseEntity.notFound().build();
    }
}