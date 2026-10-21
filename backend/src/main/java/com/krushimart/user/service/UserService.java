package com.krushimart.user.service;

import com.krushimart.product.entity.ProductCategory;
import com.krushimart.user.dto.UpdateProfileRequest;
import com.krushimart.user.dto.UserResponse;
import com.krushimart.user.entity.User;
import com.krushimart.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(User user) {
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateProfile(User user, UpdateProfileRequest request) {
        user.setFullName(request.fullName().trim());
        user.setRegion(request.region().trim());
        if (request.preferredCategories() != null) {
            List<ProductCategory> categories = request.preferredCategories().stream().distinct().toList();
            user.setPreferredCategories(categories.stream()
                    .map(ProductCategory::name)
                    .collect(Collectors.joining(",")));
        }
        if (request.notifyOptIn() != null) {
            user.setNotifyOptIn(request.notifyOptIn());
        }
        if (request.contactVisible() != null) {
            user.setContactVisible(request.contactVisible());
        }
        return UserResponse.from(userRepository.save(user));
    }
}
