package com.connectly.connectly.controller;

import com.connectly.connectly.dto.AuthRequestDTO;
import com.connectly.connectly.service.redis.SessionProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final SessionProfileService sessionProfileService;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager, SessionProfileService sessionProfileService) {
        this.authenticationManager = authenticationManager;
        this.sessionProfileService = sessionProfileService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDTO authRequest, HttpServletResponse response) {
        try {
            Authentication authenticate = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );

            Object principal = authenticate.getPrincipal();
            sessionProfileService.registerNewSession(response, principal);

            return ResponseEntity.ok(Map.of("redirect", "/chat"));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        sessionProfileService.removeSessionInformation(request, response);

        return ResponseEntity.ok(Map.of("redirect", "/login"));
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkAuth() {
        return ResponseEntity.ok(Map.of("Authenticated", "true"));
    }
}


