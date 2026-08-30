package com.marketplace.controller;

import com.marketplace.dto.LoginRequest;
import com.marketplace.dto.LoginResponse;
import com.marketplace.dto.RegisterRequest;
import com.marketplace.dto.RegisterResponse;
import com.marketplace.model.User;
import com.marketplace.security.JwtUtil;
import com.marketplace.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
        User createdUser = authService.register(request); // return the saved User from service
        RegisterResponse response = new RegisterResponse(createdUser.getId(), createdUser.getName(), createdUser.getEmail());
        return ResponseEntity.ok(response);
    }


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request, jwtUtil);
        return ResponseEntity.ok(response);
    }

}
