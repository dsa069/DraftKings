package draftkings.eureka.client.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import draftkings.eureka.client.user.exception.CustomResponse;
import draftkings.eureka.client.user.dto.UserDetailResponseDTO;
import draftkings.eureka.client.user.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "User Reviews (Deprecated)", description = "Operaciones de usuario relacionadas con reseñas (Sin uso en la versión actual)")
public class ReviewController {

    @Autowired
    private UserService userService;

    /**
     * GET /user/{userId}
     * Returns user profile with associated reviews
     * 
     * @param userId The ID of the user to retrieve
     * @return UserDetailResponseDTO containing user and reviews
     */
    // UNUSED
    @GetMapping("/user/{userId}")
    @Operation(summary = "Obtener perfil de usuario con reseñas (UNUSED)", description = "Devuelve el perfil del usuario junto con sus reseñas asociadas. Endpoint marcado como sin uso y deprecado para futuras versiones.", deprecated = true)
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Perfil de usuario y reseñas obtenidos con éxito", content = @Content(schema = @Schema(implementation = UserDetailResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content(schema = @Schema(implementation = CustomResponse.class))),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content(schema = @Schema(implementation = CustomResponse.class)))
    })
    public ResponseEntity<UserDetailResponseDTO> getUserProfileWithReviews(
            @Parameter(description = "ID del usuario a recuperar", required = true) @PathVariable Long userId) {
        UserDetailResponseDTO userProfile = userService.getUserProfileWithReviews(userId);
        return ResponseEntity.ok(userProfile);
    }
}
