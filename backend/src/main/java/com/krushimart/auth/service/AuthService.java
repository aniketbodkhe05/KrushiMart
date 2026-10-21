package com.krushimart.auth.service;

import com.krushimart.auth.dto.AuthResponse;
import com.krushimart.auth.dto.LoginRequest;
import com.krushimart.auth.dto.RegisterRequest;
import com.krushimart.common.exception.ApiException;
import com.krushimart.common.exception.ConflictException;
import com.krushimart.product.entity.ProductCategory;
import com.krushimart.security.JwtService;
import com.krushimart.user.dto.UserResponse;
import com.krushimart.user.entity.User;
import com.krushimart.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByPhone(request.phone())) {
            throw new ConflictException("An account with this phone number already exists");
        }
        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setPhone(request.phone().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setRegion(request.region().trim());
        if (request.preferredCategories() != null) {
            user.setPreferredCategories(request.preferredCategories().stream()
                    .distinct()
                    .map(ProductCategory::name)
                    .collect(Collectors.joining(",")));
        }
        user.setNotifyOptIn(request.notifyOptIn() == null || request.notifyOptIn());
        user.setContactVisible(true);
        user.setCreatedAt(Instant.now());
        userRepository.save(user);
        return response(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByPhone(request.phone().trim())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS",
                        "Phone number or password is incorrect"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS",
                    "Phone number or password is incorrect");
        }
        return response(user);
    }

    private AuthResponse response(User user) {
        return new AuthResponse(
                jwtService.generateToken(user),
                "Bearer",
                jwtService.getExpirationMs(),
                UserResponse.from(user)
        );
    }
}
