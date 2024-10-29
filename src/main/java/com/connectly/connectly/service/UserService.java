package com.connectly.connectly.service;

import com.connectly.connectly.model.User;
import com.connectly.connectly.model.UserForm;
import com.connectly.connectly.model.UserStatus;
import com.connectly.connectly.repository.UserRepository;
import com.connectly.connectly.util.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {
    private UserRepository userRepository;

    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User findUser(String name, String password) {
        return getAllUsers().stream()
                .filter(user -> user.getName().equals(name) && passwordEncoder.matches(password, user.getPassword()))
                .findFirst()
                .orElse(null);
    }

    public List<User> getAllUsers() {
        return (List<User>) userRepository.findAll();
    }

    public List<User> getAllUsersExcludingName(String name) {
        ArrayList<User> users = (ArrayList<User>) userRepository.findAll();
        users.removeIf(user -> user.getName().equals(name));
        return users;
    }

    public User registerUser(UserForm formUser) {
        User existingUser = findUser(formUser.getName(), formUser.getPassword());

        if (existingUser == null) {
            User newUser = new User();
            String encodedPassword = passwordEncoder.encode(formUser.getPassword());
            newUser.setName(formUser.getName());
            newUser.setPassword(encodedPassword);
            newUser.setStatus(UserStatus.ONLINE);
            newUser.setSession(UserUtils.generateSessionCode());
            newUser.setAvatarUrl(UserUtils.generateRandomAvatar());
            newUser.setColor(UserUtils.generateRandomHexColor());

            userRepository.save(newUser);
            return newUser;
        }

        return existingUser;
    }

}
