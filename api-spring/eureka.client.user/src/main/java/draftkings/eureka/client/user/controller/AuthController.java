package draftkings.eureka.client.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import draftkings.eureka.client.user.exception.ConflictException;
import draftkings.eureka.client.user.exception.CustomResponse;
import draftkings.eureka.client.user.exception.ResourceNotFoundException;
import draftkings.eureka.client.user.exception.UnauthorizedException;
import draftkings.eureka.client.user.repository.UserRepository;
import draftkings.eureka.client.user.domain.User;
import org.springframework.http.HttpStatus;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Operaciones relacionadas con la autenticación, sincronización y perfiles de usuario basados en Firebase")
public class AuthController {

    @Autowired
    private UserRepository userRepository; // Tu repositorio JPA para PostgreSQL

    @PostMapping("/sync-user")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Sincronizar usuario desde Firebase", description = "Valida el token JWT de Firebase mediante Spring Security, extrae el UID y el email, guarda el usuario en PostgreSQL y valida estrictamente que el rol asignado sea ADMIN o USER.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario sincronizado y registrado con éxito en PostgreSQL", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"message\":\"Usuario registrado en PostgreSQL con éxito y rol asignado\"}"))),
            @ApiResponse(responseCode = "401", description = "No autorizado - El token de autenticación falta o no es válido", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-05-29T00:20:00Z\",\"status\":401,\"error\":\"Authentication token is required\",\"path\":\"/api/auth/sync-user\"}"))),
            @ApiResponse(responseCode = "409", description = "Conflicto - El usuario ya se encuentra sincronizado", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-05-29T00:20:00Z\",\"status\":409,\"error\":\"Usuario ya sincronizado\",\"path\":\"/api/auth/sync-user\"}"))),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor inesperado", content = @Content(schema = @Schema(implementation = CustomResponse.class)))
    })
    public ResponseEntity<?> syncUserToPostgres(@AuthenticationPrincipal Jwt jwt, @RequestBody User additionalData) {
        if (jwt == null) {
            throw new UnauthorizedException("Authentication token is required");
        }

        // 1. Extraer datos del JWT validado por Spring Security
        String firebaseUid = jwt.getSubject(); // El 'subject' en Firebase es el UID
        String email = jwt.getClaimAsString("email");

        // 2. Verificar si el usuario ya existe en PostgreSQL
        User existingUser = userRepository.findByFirebaseUid(firebaseUid);
        if (existingUser != null) {
            throw new ConflictException("Usuario ya sincronizado");
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
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Obtener el perfil del usuario autenticado", description = "Recupera la entidad completa del usuario de la base de datos local utilizando el UID extraído del subject del JWT actual.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Perfil de usuario localizado y retornado con éxito", content = @Content(schema = @Schema(implementation = User.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado - El token JWT de autenticación falta o expiró", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-05-29T00:20:00Z\",\"status\":401,\"error\":\"Authentication token is required\",\"path\":\"/api/auth/me\"}"))),
            @ApiResponse(responseCode = "404", description = "Usuario no localizado en la base de datos", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-05-29T00:20:00Z\",\"status\":404,\"error\":\"Usuario no encontrado\",\"path\":\"/api/auth/me\"}"))),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content(schema = @Schema(implementation = CustomResponse.class)))
    })
    public ResponseEntity<User> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            throw new UnauthorizedException("Authentication token is required");
        }

        // El 'sub' del JWT es el UID de Firebase
        String uid = jwt.getSubject();

        User user = userRepository.findByFirebaseUid(uid);
        if (user == null) {
            throw new ResourceNotFoundException(HttpStatus.NOT_FOUND, "Usuario no encontrado");
        }
        return ResponseEntity.ok(user);
    }
}