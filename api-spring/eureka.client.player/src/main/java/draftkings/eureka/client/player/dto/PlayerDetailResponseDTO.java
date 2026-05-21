package draftkings.eureka.client.player.dto;

import draftkings.eureka.client.player.domain.Player;
import java.util.List;

// DTO para la respuesta detallada del jugador, incluyendo sus reviews para el frontend

public class PlayerDetailResponseDTO {
    private Player player;
    private List<ReviewDTO> reviews;

    public PlayerDetailResponseDTO(Player player, List<ReviewDTO> reviews) {
        this.player = player;
        this.reviews = reviews;
    }

    // Getters y Setters
    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public List<ReviewDTO> getReviews() {
        return reviews;
    }

    public void setReviews(List<ReviewDTO> reviews) {
        this.reviews = reviews;
    }
}