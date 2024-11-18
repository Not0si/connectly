package com.connectly.connectly.service.database;


import com.connectly.connectly.model.database.Role;
import com.connectly.connectly.repository.database.RoleRepository;
import com.connectly.connectly.model.database.User;
import com.connectly.connectly.repository.database.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
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

        return user;
    }

    private String generateRandomAvatar() {
        Random random = new Random();
        int num = random.nextInt(1, 28);
        return "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_%d.png".formatted(num);
    }


    public Page<User> searchByUserName(String userName, Pageable pageable){
       return userRepository.findByUserNameContainsIgnoreCase(userName,pageable);
    }
}
