package com.connectly.connectly.controller;

import com.connectly.connectly.dto.UserDTO;
import com.connectly.connectly.model.redis.SessionProfile;
import com.connectly.connectly.service.database.UserService;
import com.connectly.connectly.model.database.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public Page<UserDTO> getAllUsers(
            @RequestParam(required = false, defaultValue = "") String username,
            Pageable pageable) {

        return userService.searchByUserName(username, pageable);
    }

    @GetMapping("/me")
    public UserDTO getMyInformation() {
        SessionProfile profile = (SessionProfile) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = profile.getUserName();

        if (username == null) return null;

        return userService.getUserByUserName(username);
    }
}
