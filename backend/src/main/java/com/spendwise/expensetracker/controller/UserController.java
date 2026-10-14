package com.spendwise.expensetracker.controller;

import com.spendwise.expensetracker.dto.auth.UserProfileDto;
import com.spendwise.expensetracker.dto.common.ApiResponse;
import com.spendwise.expensetracker.entity.User;
import com.spendwise.expensetracker.repository.UserRepository;
import com.spendwise.expensetracker.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public UserController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile() {
        UserProfileDto profile = authService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PutMapping("/currency")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateCurrency(@RequestBody Map<String, String> request) {
        String currency = request.get("currency");
        if (currency == null || currency.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Currency code is required"));
        }

        User user = authService.getAuthenticatedUser();
        user.setCurrency(currency.trim().toUpperCase());
        userRepository.save(user);

        UserProfileDto updated = authService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.ok("Currency updated successfully", updated));
    }
}
