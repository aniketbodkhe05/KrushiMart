package com.krushimart.user.controller;

import com.krushimart.security.CurrentUserService;
import com.krushimart.user.dto.UpdateProfileRequest;
import com.krushimart.user.dto.UserResponse;
import com.krushimart.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me")
public class UserController {

    private final UserService userService;
    private final CurrentUserService currentUserService;

    public UserController(UserService userService, CurrentUserService currentUserService) {
        this.userService = userService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public UserResponse me() {
        return userService.getProfile(currentUserService.requireUser());
    }

    @PutMapping
    public UserResponse update(@Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(currentUserService.requireUser(), request);
    }
}
