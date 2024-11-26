package com.connectly.connectly.service;

import com.connectly.connectly.model.database.User;
import com.connectly.connectly.repository.database.RoleRepository;
import com.connectly.connectly.repository.database.UserRepository;
import com.connectly.connectly.service.database.UserService;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    public void insertUserTest() {
        // Arrange
        String userName = "Lorem Ipsum";

        // Act
        User user = userService.registerUser(userName, "TestPassword");

        // Assert
        Assertions.assertThat(user).isNotNull();
        Assertions.assertThat(user.getUserName()).isEqualTo(userName);
    }
}
