package com.connectly.connectly.service.database;

import com.connectly.connectly.config.exception.ResourceNotFoundException;
import com.connectly.connectly.dto.UserDTO;
import com.connectly.connectly.model.database.Role;
import com.connectly.connectly.repository.database.RoleRepository;
import com.connectly.connectly.model.database.User;
import com.connectly.connectly.repository.database.UserRepository;
import com.connectly.connectly.util.ObjectsMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Random;

@Service
public class UserService {
    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, RoleRepository roleRepository,
            BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(String name, String password) {
        Optional<User> optionalUser = userRepository.findByUserName(name);

        if (optionalUser.isEmpty()) {
            User newUser = generateNewUserData(name, password);

            userRepository.save(newUser);

            return newUser;
        } else {
            User user = optionalUser.get();

            if (passwordEncoder.matches(password, user.getPassword())) {
                return user;
            }

            return null;
        }
    }

    private User generateNewUserData(String name, String password) {
        Role clientRole = roleRepository.findByName("client");
        User user = new User();
        // Role clientRole =
        user.setUserName(name);
        user.setPassword(passwordEncoder.encode(password));
        user.setAvatarUrl(generateRandomAvatar());
        user.setRole(clientRole);

        return user;
    }

    private String generateRandomAvatar() {
        Random random = new Random();
        int num = random.nextInt(1, 28);
        return "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_%d.png".formatted(num);
    }

    public UserDTO getUserByUserName(String userName) throws ResourceNotFoundException {
        return userRepository.findByUserName(userName)
                .map(ObjectsMapper::mapUserToUserDTO)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public Page<UserDTO> searchByUserName(String userName, Pageable pageable) {
        String trimmedUserName = userName.trim();
        Page<User> usersPage = userRepository.searchByUserName(trimmedUserName, pageable);
        return usersPage.map(ObjectsMapper::mapUserToUserDTO);
    }
}
