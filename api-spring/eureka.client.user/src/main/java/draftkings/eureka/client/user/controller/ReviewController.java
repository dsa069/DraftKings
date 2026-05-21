package draftkings.eureka.client.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import draftkings.eureka.client.user.dto.UserDetailResponseDTO;
import draftkings.eureka.client.user.service.UserService;

@RestController
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
    @GetMapping("/user/{userId}")
    public ResponseEntity<UserDetailResponseDTO> getUserProfileWithReviews(@PathVariable Long userId) {
        try {
            UserDetailResponseDTO userProfile = userService.getUserProfileWithReviews(userId);
            return new ResponseEntity<>(userProfile, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
