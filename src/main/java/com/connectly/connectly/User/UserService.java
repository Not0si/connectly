package com.connectly.connectly.User;


import com.connectly.connectly.Role.Role;
import com.connectly.connectly.Role.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class UserService {
    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private BCryptPasswordEncoder passwordEncoder;
   
    @Autowired
    public UserService(UserRepository userRepository, RoleRepository roleRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(String name, String password) {
        User user = userRepository.findByUserName(name);

        if (user == null) {
            User newUser = generateNewUserData(name, password);

            userRepository.save(newUser);

            return newUser;
        } else {
            if (passwordEncoder.matches(password, user.getPassword())) {
                return user;
            }

            return null;
        }
    }

    private User generateNewUserData(String name, String password) {
        Role clientRole = roleRepository.findByName("client");
        User user = new User();

        user.setUserName(name);
        user.setPassword(passwordEncoder.encode(password));
        user.setAvatarUrl(generateRandomAvatar());
        user.setRole(clientRole);
        user.setJoinedAt(LocalDateTime.now());

        return user;
    }

    private String generateRandomAvatar() {
        Random random = new Random();
        int num = random.nextInt(1, 28);
        return "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_%d.png".formatted(num);
    }

}
