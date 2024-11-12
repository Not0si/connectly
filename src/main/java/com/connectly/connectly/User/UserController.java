package com.connectly.connectly.User;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {
    private UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/api/user")
    public void addUser() {
        userService.registerUser("Oussi", "3kmr2o3ri");
//        userService.registerUser(name, password);
//        userService.registerUser(name, password);
    }
}
