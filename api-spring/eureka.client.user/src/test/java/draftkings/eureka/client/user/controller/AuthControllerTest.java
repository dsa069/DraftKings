package draftkings.eureka.client.user.controller;

import draftkings.eureka.client.user.domain.User;
import draftkings.eureka.client.user.exception.ConflictException;
import draftkings.eureka.client.user.exception.ResourceNotFoundException;
import draftkings.eureka.client.user.exception.UnauthorizedException;
import draftkings.eureka.client.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthController authController;

    private User additionalData;

    @BeforeEach
    void setUp() {
        additionalData = new User();
        additionalData.setUserName("  pepe  ");
        additionalData.setRole("ADMIN");
    }

    @Test
    void syncUserToPostgresShouldThrowUnauthorizedWhenJwtMissing() {
        assertThrows(UnauthorizedException.class, () -> authController.syncUserToPostgres(null, additionalData));
        verifyNoInteractions(userRepository);
    }

    @Test
    void syncUserToPostgresShouldThrowConflictWhenUserAlreadyExists() {
        Jwt jwt = buildJwt("uid-1", "user@mail.com");
        User existing = new User();
        existing.setFirebaseUid("uid-1");
        when(userRepository.findByFirebaseUid("uid-1")).thenReturn(existing);

        assertThrows(ConflictException.class, () -> authController.syncUserToPostgres(jwt, additionalData));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void syncUserToPostgresShouldSaveNewUserWithIncomingAdminRole() {
        Jwt jwt = buildJwt("uid-2", "admin@mail.com");
        when(userRepository.findByFirebaseUid("uid-2")).thenReturn(null);

        ResponseEntity<?> response = authController.syncUserToPostgres(jwt, additionalData);

        assertEquals(HttpStatus.OK, response.getStatusCode());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();

        assertEquals("uid-2", saved.getFirebaseUid());
        assertEquals("admin@mail.com", saved.getEmail());
        assertEquals("pepe", saved.getUserName());
        assertEquals("ADMIN", saved.getRole());
    }

    @Test
    void syncUserToPostgresShouldDefaultRoleToUserWhenIncomingRoleInvalid() {
        Jwt jwt = buildJwt("uid-3", "user3@mail.com");
        when(userRepository.findByFirebaseUid("uid-3")).thenReturn(null);

        User badRolePayload = new User();
        badRolePayload.setRole("SUPERADMIN");

        authController.syncUserToPostgres(jwt, badRolePayload);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals("USER", userCaptor.getValue().getRole());
    }

    @Test
    void getMyProfileShouldThrowUnauthorizedWhenJwtMissing() {
        assertThrows(UnauthorizedException.class, () -> authController.getMyProfile(null));
        verifyNoInteractions(userRepository);
    }

    @Test
    void getMyProfileShouldThrowNotFoundWhenUserMissing() {
        Jwt jwt = buildJwt("uid-404", "none@mail.com");
        when(userRepository.findByFirebaseUid("uid-404")).thenReturn(null);

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> authController.getMyProfile(jwt));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void getMyProfileShouldReturnUserWhenFound() {
        Jwt jwt = buildJwt("uid-10", "user10@mail.com");
        User user = new User();
        user.setId(10L);
        user.setFirebaseUid("uid-10");
        user.setRole("USER");

        when(userRepository.findByFirebaseUid("uid-10")).thenReturn(user);

        ResponseEntity<User> response = authController.getMyProfile(jwt);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("uid-10", response.getBody().getFirebaseUid());
    }

    private Jwt buildJwt(String sub, String email) {
        return new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Map.of("alg", "none"),
                Map.of("sub", sub, "email", email));
    }
}
