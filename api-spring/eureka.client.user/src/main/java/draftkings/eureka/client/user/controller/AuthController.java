package draftkings.eureka.client.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import draftkings.eureka.client.user.repository.UserRepository;
import draftkings.eureka.client.user.domain.User;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository; // Tu repositorio JPA para PostgreSQL

    @PostMapping("/sync-user")
    public ResponseEntity<?> syncUserToPostgres(@AuthenticationPrincipal Jwt jwt, @RequestBody User additionalData) {
        // 1. Extraer datos del JWT validado por Spring Security
        String firebaseUid = jwt.getSubject(); // El 'subject' en Firebase es el UID
        String email = jwt.getClaimAsString("email");

        // 2. Verificar si el usuario ya existe en PostgreSQL
        User existingUser = userRepository.findByFirebaseUid(firebaseUid);
        if (existingUser != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuario ya sincronizado"));
        }

        // 3. Crear el usuario en Postgres con la lógica de negocio
        User newUser = new User();
        newUser.setFirebaseUid(firebaseUid);
        newUser.setEmail(email);

        // Verificamos que el nombre de usuario no sea nulo antes de setearlo
        if (additionalData.getUserName() != null) {
            newUser.setUserName(additionalData.getUserName().trim());
        }

        // 4. Validar y setear el ROL
        String incomingRole = additionalData.getRole();
        // Validamos estrictamente que solo puedan ser "ADMIN" o "USER" por seguridad
        if ("ADMIN".equals(incomingRole) || "USER".equals(incomingRole)) {
            newUser.setRole(incomingRole);
        } else {
            newUser.setRole("USER"); // Rol por defecto si mandan basura o viene vacío
        }

        userRepository.save(newUser);

        return ResponseEntity.ok(Map.of("message", "Usuario registrado en PostgreSQL con éxito y rol asignado"));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        // El 'sub' del JWT es el UID de Firebase
        String uid = jwt.getSubject();

        User user = userRepository.findByFirebaseUid(uid);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }
}