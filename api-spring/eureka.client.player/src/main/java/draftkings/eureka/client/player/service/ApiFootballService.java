package draftkings.eureka.client.player.service;

import draftkings.eureka.client.player.dto.PlayerExternalDTO;

import java.util.List;

public interface ApiFootballService {

    List<PlayerExternalDTO> searchExternalPlayers(String search);
}