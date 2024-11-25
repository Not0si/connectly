package com.connectly.connectly.repository;


import com.connectly.connectly.model.database.User;
import com.connectly.connectly.repository.database.UserRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.EmbeddedDatabaseConnection;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2)
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testFindAllUsers() {
        // Act
        List<User> users = userRepository.findAll();

        // Assert
        assertEquals(20, users.size());
    }

    @Test
    public void testFindByUserNameContainsIgnoreCase() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<User> userPage1 = userRepository.searchByUserName("emma", pageable);
 
        // Assert
        Assertions.assertThat(userPage1.getContent()).hasSize(1);
    }

}
