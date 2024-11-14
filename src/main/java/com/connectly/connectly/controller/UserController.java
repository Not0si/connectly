package com.connectly.connectly.controller;

import com.connectly.connectly.service.database.UserService;
import com.connectly.connectly.model.database.User;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers(
            @RequestParam(required = false, defaultValue = "") String name,
            Pageable pageable) {

       return userService.getAllUsers(name,pageable);

    }
}