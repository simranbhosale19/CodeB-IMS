
package com.codeb.backend;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final LoginService loginService;
    private final UserRepository userRepository;

    public AuthController(
            AuthService authService,
            LoginService loginService,
            UserRepository userRepository) {
        this.authService = authService;
        this.loginService = loginService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        if (request.fullName() == null || request.fullName().isBlank()
                || request.email() == null || request.email().isBlank()
                || request.password() == null
                || request.password().length() < 8) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Enter your name and email, and a password of at least 8 characters.")
            );
        }

        try {
            User user = authService.register(
                request.fullName(),
                request.email(),
                request.password()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                    "message", "Registration successful",
                    "userId", user.getUserId(),
                    "fullName", user.getFullName(),
                    "email", user.getEmail(),
                    "role", user.getRole()
                )
            );
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                Map.of("message", exception.getMessage())
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        if (request.email() == null || request.email().isBlank()
                || request.password() == null || request.password().isBlank()) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Email and password are required.")
            );
        }

        try {
            User user = loginService.login(
                request.email(), request.password()
            );

            return ResponseEntity.ok(
                Map.of(
                    "message", "Login successful",
                    "userId", user.getUserId(),
                    "fullName", user.getFullName(),
                    "email", user.getEmail(),
                    "role", user.getRole()
                )
            );
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("message", exception.getMessage())
            );
        }
    }

    @PostMapping("/admin/users")
    public ResponseEntity<?> createUser(
            @RequestBody RegisterRequest request,
            @RequestHeader(value = "X-Admin-Email", required = false)
            String adminEmail) {

        if (adminEmail == null || adminEmail.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("message", "Admin authentication is required.")
            );
        }

        User admin = userRepository.findByEmail(
            adminEmail.trim().toLowerCase()
        ).orElse(null);

        if (admin == null || !"Admin".equalsIgnoreCase(admin.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of("message", "Only Admin users can create users.")
            );
        }

        if (request.fullName() == null || request.fullName().isBlank()
                || request.email() == null || request.email().isBlank()
                || request.password() == null
                || request.password().length() < 8) {
            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Enter a name, email, and password of at least 8 characters.")
            );
        }

        try {
            User user = authService.register(
                request.fullName(),
                request.email(),
                request.password()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                    "message", "User created",
                    "userId", user.getUserId(),
                    "fullName", user.getFullName(),
                    "email", user.getEmail(),
                    "role", user.getRole()
                )
            );
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(
                Map.of("message", exception.getMessage())
            );
        }
    }

    public record RegisterRequest(
        String fullName,
        String email,
        String password
    ) {}
}
